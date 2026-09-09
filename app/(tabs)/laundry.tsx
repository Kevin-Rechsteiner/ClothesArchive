import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SwipeableLaundryItem, isWhiteLaundry } from '@/components/SwipeableLaundryItem';
import { FilterChip } from '@/components/ui/filter-chip';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { getClothesByStatus, updateWashStatus } from '@/db/queries';
import { useAppTheme } from '@/hooks/use-app-theme';

const STATUSES = ['im Wäschekorb', 'in der Wäsche', 'im Tumbler'] as const;
type Status = (typeof STATUSES)[number];

const BOX_META: Record<Status, { title: string; emoji: string; bulkLabel: string }> = {
  'im Wäschekorb': { title: 'Wäschekorb', emoji: '', bulkLabel: 'Alle in Waschmaschine' },
  'in der Wäsche': { title: 'Waschmaschine', emoji: '', bulkLabel: 'Alle in Tumbler' },
  'im Tumbler': { title: 'Tumbler', emoji: '', bulkLabel: 'Alle fertig' },
};

type ColorFilter = 'alle' | 'weiss' | 'farbig';

function getNextStatus(currentStatus: Status): Status | 'verfügbar' {
  const order: (Status | 'verfügbar')[] = [
    'im Wäschekorb',
    'in der Wäsche',
    'im Tumbler',
    'verfügbar',
  ];
  const index = order.indexOf(currentStatus);
  return order[index + 1] ?? 'verfügbar';
}

function getPrevStatus(currentStatus: Status): Status | null {
  const order: Status[] = ['im Wäschekorb', 'in der Wäsche', 'im Tumbler'];
  const index = order.indexOf(currentStatus);
  if (index <= 0) return null;
  return order[index - 1];
}

export default function LaundryScreen() {
  const { colors } = useAppTheme();
  const [items, setItems] = useState<Record<Status, any[]>>({
    'im Wäschekorb': [],
    'in der Wäsche': [],
    'im Tumbler': [],
  });
  const [colorFilter, setColorFilter] = useState<ColorFilter>('alle');

  const loadItems = useCallback(() => {
    setItems({
      'im Wäschekorb': getClothesByStatus('im Wäschekorb') as any[],
      'in der Wäsche': getClothesByStatus('in der Wäsche') as any[],
      'im Tumbler': getClothesByStatus('im Tumbler') as any[],
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems])
  );

  function filterByColor(list: any[]): any[] {
    if (colorFilter === 'alle') return list;
    if (colorFilter === 'weiss') return list.filter((i) => isWhiteLaundry(i.color));
    return list.filter((i) => !isWhiteLaundry(i.color));
  }

  // --- Single-item actions ---

  function handleRemove(id: number, currentStatus: Status) {
    updateWashStatus(id, 'verfügbar');
    setItems((prev) => ({
      ...prev,
      [currentStatus]: prev[currentStatus].filter((i) => i.id !== id),
    }));
  }

  function handleMoveForward(id: number, currentStatus: Status) {
    const next = getNextStatus(currentStatus);
    const item = items[currentStatus].find((i) => i.id === id);
    if (!item) return;

    updateWashStatus(id, next);

    if (next === 'verfügbar') {
      // Remove from current, don't add anywhere
      setItems((prev) => ({
        ...prev,
        [currentStatus]: prev[currentStatus].filter((i) => i.id !== id),
      }));
    } else {
      setItems((prev) => ({
        ...prev,
        [currentStatus]: prev[currentStatus].filter((i) => i.id !== id),
        [next]: [...prev[next], { ...item, wash_status: next }],
      }));
    }
  }

  function handleMoveBack(id: number, currentStatus: Status) {
    const prev = getPrevStatus(currentStatus);
    if (!prev) return;
    const item = items[currentStatus].find((i) => i.id === id);
    if (!item) return;

    updateWashStatus(id, prev);
    setItems((prevState) => ({
      ...prevState,
      [currentStatus]: prevState[currentStatus].filter((i) => i.id !== id),
      [prev]: [...prevState[prev], { ...item, wash_status: prev }],
    }));
  }

  // --- Bulk actions ---

  function handleMoveAll(currentStatus: Status) {
    const nextStatus = getNextStatus(currentStatus);
    const filteredItems = filterByColor(items[currentStatus]);
    if (filteredItems.length === 0) return;

    // Update each filtered item individually
    for (const item of filteredItems) {
      updateWashStatus(item.id, nextStatus);
    }

    const filteredIds = new Set(filteredItems.map((i) => i.id));

    if (nextStatus === 'verfügbar') {
      setItems((prev) => ({
        ...prev,
        [currentStatus]: prev[currentStatus].filter((i) => !filteredIds.has(i.id)),
      }));
    } else {
      setItems((prev) => ({
        ...prev,
        [currentStatus]: prev[currentStatus].filter((i) => !filteredIds.has(i.id)),
        [nextStatus]: [
          ...prev[nextStatus],
          ...filteredItems.map((item) => ({ ...item, wash_status: nextStatus })),
        ],
      }));
    }
  }

  const totalItems = STATUSES.reduce((sum, status) => sum + items[status].length, 0);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Screen title="Wäsche" subtitle={`${totalItems} Stück in Bearbeitung`}>
        {/* Color filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          <FilterChip
            label="Alle"
            active={colorFilter === 'alle'}
            onPress={() => setColorFilter('alle')}
          />
          <FilterChip
            label="Weisse Wäsche"
            active={colorFilter === 'weiss'}
            onPress={() => setColorFilter('weiss')}
          />
          <FilterChip
            label="Farbige Wäsche"
            active={colorFilter === 'farbig'}
            onPress={() => setColorFilter('farbig')}
          />
        </ScrollView>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {STATUSES.map((status) => {
            const meta = BOX_META[status];
            const filtered = filterByColor(items[status]);
            const totalInBox = items[status].length;

            return (
              <View
                key={status}
                style={[
                  styles.box,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.boxHeader}>
                  <View style={styles.boxTitleRow}>
                    <Text style={styles.boxEmoji}>{meta.emoji}</Text>
                    <View style={styles.boxTitleBlock}>
                      <Text style={[styles.boxTitle, { color: colors.text }]}>{meta.title}</Text>
                      <Text style={[styles.boxCount, { color: colors.textSecondary }]}>
                        {colorFilter === 'alle'
                          ? `${totalInBox} Stück`
                          : `${filtered.length} von ${totalInBox} Stück`}
                      </Text>
                    </View>
                  </View>

                  {filtered.length > 0 && (
                    <TouchableOpacity
                      style={[styles.bulkButton, { backgroundColor: colors.accent }]}
                      onPress={() => handleMoveAll(status)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.bulkButtonText, { color: colors.accentText }]}>
                        {meta.bulkLabel}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                {filtered.length === 0 ? (
                  <View style={[styles.emptyBox, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.empty, { color: colors.textMuted }]}>
                      {totalInBox > 0 && colorFilter !== 'alle'
                        ? 'Keine passenden Teile'
                        : 'Leer'}
                    </Text>
                  </View>
                ) : (
                  <FlatList
                    data={filtered}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                      <SwipeableLaundryItem
                        item={item}
                        currentStatus={status}
                        onRemove={(id) => handleRemove(id, status)}
                        onMoveForward={(id) => handleMoveForward(id, status)}
                        onMoveBack={(id) => handleMoveBack(id, status)}
                      />
                    )}
                    scrollEnabled={false}
                  />
                )}
              </View>
            );
          })}

          {/* Swipe hint */}
          <View style={[styles.hintCard, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.hintText, { color: colors.textMuted }]}>
              Swipe nach rechts = Entfernen · Swipe nach links = Verschieben
            </Text>
          </View>
        </ScrollView>
      </Screen>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    flexGrow: 0,
    marginBottom: Spacing.sm,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxxl,
    gap: Spacing.lg,
  },
  box: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
  },
  boxHeader: {
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  boxTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  boxTitleBlock: {
    flex: 1,
  },
  boxEmoji: {
    fontSize: 28,
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  boxCount: {
    fontSize: 13,
    marginTop: 2,
  },
  bulkButton: {
    alignSelf: 'stretch',
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  bulkButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  emptyBox: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  empty: {
    fontSize: 14,
    fontWeight: '500',
  },
  hintCard: {
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});

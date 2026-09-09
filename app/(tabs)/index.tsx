import { useCallback, useState } from 'react';
import {
  FlatList, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { Link, router, useFocusEffect } from 'expo-router';

import { FilterChip } from '@/components/ui/filter-chip';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing, getStatusTheme } from '@/constants/theme';
import { getAllClothes, updateWashStatusForMultiple, deleteClothesMultiple } from '@/db/queries';
import { useAppTheme } from '@/hooks/use-app-theme';
import { useThemeMode } from '@/hooks/theme-context';

const NEXT_MODE = { light: 'dark', dark: 'light' } as const;
const MODE_ICON = { light: 'sun.max.fill', dark: 'moon.fill' } as const;

export default function HomeScreen() {
  const { colors, scheme } = useAppTheme();
  const { mode, setMode } = useThemeMode();
  
  const [clothes, setClothes] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const loadClothes = useCallback(() => {
    setClothes(getAllClothes() as any[]);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadClothes();
    }, [loadClothes])
  );

  const categories = Array.from(new Set(clothes.map((c) => c.category))).filter(Boolean) as string[];

  const filtered = clothes.filter((item) => {
    if (selectedCategory && item.category !== selectedCategory) return false;
    if (selectedStatus === 'verfügbar' && item.wash_status !== 'verfügbar') return false;
    if (selectedStatus === 'nicht verfügbar' && item.wash_status === 'verfügbar') return false;
    return true;
  });

  function toggleSelection(id: number) {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  }

  function handleMoveToLaundry() {
    const ids = Array.from(selectedIds);
    updateWashStatusForMultiple(ids, 'im Wäschekorb');
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    loadClothes();
  }

  function handleDeleteSelected() {
    const ids = Array.from(selectedIds);
    deleteClothesMultiple(ids);
    setIsSelectionMode(false);
    setSelectedIds(new Set());
    loadClothes();
  }

  function renderCard({ item }: { item: any }) {
    const status = getStatusTheme(item.wash_status, scheme);
    const isSelected = selectedIds.has(item.id);

    if (viewMode === 'list') {
      return (
        <TouchableOpacity
          style={[
            styles.listCard, 
            { backgroundColor: colors.surface, borderColor: isSelected ? colors.accent : colors.border },
            isSelectionMode && isSelected && { backgroundColor: colors.accentSoft }
          ]}
          onPress={() => {
            if (isSelectionMode) toggleSelection(item.id);
            else router.push(`../clothes/${item.id}`);
          }}
          onLongPress={() => {
            if (!isSelectionMode) {
              setIsSelectionMode(true);
              toggleSelection(item.id);
            }
          }}
          activeOpacity={0.85}
        >
          {item.photo_uri ? (
            <Image source={{ uri: item.photo_uri }} style={styles.listImage} />
          ) : (
            <View style={[styles.listImagePlaceholder, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Kein Foto</Text>
            </View>
          )}
          <View style={styles.listBody}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
          </View>
          
          {isSelectionMode ? (
             <View style={[styles.checkbox, isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                {isSelected && <IconSymbol name="checkmark" size={12} color={colors.accentText} />}
             </View>
          ) : (
             <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
                <Text style={[styles.statusText, { color: status.color }]} numberOfLines={1}>{status.label}</Text>
             </View>
          )}
        </TouchableOpacity>
      );
    }

    // Grid View
    return (
      <TouchableOpacity
        style={[
          styles.card, 
          { backgroundColor: colors.surface, borderColor: isSelected ? colors.accent : colors.border, shadowColor: colors.shadow },
          isSelectionMode && isSelected && { backgroundColor: colors.accentSoft }
        ]}
        onPress={() => {
          if (isSelectionMode) toggleSelection(item.id);
          else router.push(`../clothes/${item.id}`);
        }}
        onLongPress={() => {
          if (!isSelectionMode) {
            setIsSelectionMode(true);
            toggleSelection(item.id);
          }
        }}
        activeOpacity={0.85}
      >
        <View style={[styles.imageWrap, { backgroundColor: colors.surfaceMuted }]}>
          {item.photo_uri ? (
            <Image source={{ uri: item.photo_uri }} style={styles.cardImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.imagePlaceholderText, { color: colors.textMuted }]}>Kein Foto</Text>
            </View>
          )}
          
          {isSelectionMode && (
             <View style={[styles.checkboxAbs, isSelected && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                {isSelected && <IconSymbol name="checkmark" size={14} color={colors.accentText} />}
             </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
          <Text style={[styles.cardSub, { color: colors.textSecondary }]} numberOfLines={1}>{item.category}</Text>
          <View style={[styles.statusBadge, { backgroundColor: status.background }]}>
            <Text style={[styles.statusText, { color: status.color }]} numberOfLines={1}>{status.label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const headerRight = isSelectionMode ? (
    <TouchableOpacity
      onPress={() => {
        setIsSelectionMode(false);
        setSelectedIds(new Set());
      }}
      style={styles.cancelSelectionBtn}
    >
      <Text style={{ color: colors.danger, fontWeight: '600', fontSize: 16 }}>Abbrechen</Text>
    </TouchableOpacity>
  ) : (
    <View style={styles.headerActionsRow}>
      <TouchableOpacity
        onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
        style={[styles.headerIconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <IconSymbol name={viewMode === 'grid' ? 'list.bullet' : 'square.grid.2x2.fill'} size={20} color={colors.text} />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => setMode(NEXT_MODE[mode])}
        style={[styles.headerIconButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
      >
        <IconSymbol name={MODE_ICON[mode]} size={20} color={colors.accent} />
      </TouchableOpacity>
    </View>
  );

  return (
    <Screen
      title={isSelectionMode ? `${selectedIds.size} ausgewählt` : "Mein Kleider-Archiv"}
      subtitle={isSelectionMode ? "Wähle Kleidungsstücke aus" : `${filtered.length} von ${clothes.length} Stück`}
      headerRight={headerRight}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContainer}
      >
        <FilterChip
          label="Alle"
          active={!selectedCategory && !selectedStatus}
          onPress={() => { setSelectedCategory(null); setSelectedStatus(null); }}
        />
        {categories.map((cat) => (
          <FilterChip
            key={cat}
            label={cat}
            active={selectedCategory === cat}
            onPress={() => { setSelectedCategory(selectedCategory === cat ? null : cat); setSelectedStatus(null); }}
          />
        ))}
        <FilterChip
          label="Verfügbar"
          active={selectedStatus === 'verfügbar'}
          onPress={() => { setSelectedStatus(selectedStatus === 'verfügbar' ? null : 'verfügbar'); setSelectedCategory(null); }}
        />
        <FilterChip
          label="Nicht verfügbar"
          active={selectedStatus === 'nicht verfügbar'}
          onPress={() => { setSelectedStatus(selectedStatus === 'nicht verfügbar' ? null : 'nicht verfügbar'); setSelectedCategory(null); }}
        />
      </ScrollView>

      <View style={styles.gridContainer}>
        {filtered.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Keine Kleidungsstücke</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Passe die Filter an oder füge dein erstes Stück hinzu.
            </Text>
          </View>
        ) : (
          <FlatList
            key={viewMode} // Force re-render on numColumns change
            data={filtered}
            keyExtractor={(item) => item.id.toString()}
            numColumns={viewMode === 'grid' ? 2 : 1}
            columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            renderItem={renderCard}
          />
        )}
      </View>

      {!isSelectionMode && (
        <Link href="/add-clothes" asChild>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.text, shadowColor: colors.shadow }]}
            activeOpacity={0.9}
          >
            <Text style={[styles.fabText, { color: colors.background }]}>+ Hinzufügen</Text>
          </TouchableOpacity>
        </Link>
      )}

      {isSelectionMode && selectedIds.size > 0 && (
        <View style={[styles.bulkActionBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.bulkActionButton, { backgroundColor: colors.dangerSoft }]}
            onPress={handleDeleteSelected}
          >
            <IconSymbol name="trash.fill" size={20} color={colors.danger} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.bulkActionPrimary, { backgroundColor: colors.accent }]}
            onPress={handleMoveToLaundry}
          >
             <Text style={[styles.bulkActionText, { color: colors.accentText }]}>
               In den Wäschekorb
             </Text>
          </TouchableOpacity>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  gridContent: {
    paddingBottom: 96,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  card: {
    flex: 1,
    maxWidth: '48%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  listImage: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
  },
  listImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listBody: {
    flex: 1,
    gap: 4,
  },
  imageWrap: {
    aspectRatio: 1,
    width: '100%',
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholderText: {
    fontSize: 12,
    fontWeight: '500',
  },
  cardBody: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    marginTop: Spacing.xs,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyState: {
    marginTop: Spacing.xxxl,
    padding: Spacing.xxl,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.pill,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 4,
  },
  fabText: {
    fontSize: 15,
    fontWeight: '700',
  },
  headerActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelSelectionBtn: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4D0C8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxAbs: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#D4D0C8',
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: Spacing.lg,
    paddingBottom: 40,
    gap: Spacing.md,
    borderTopWidth: 1,
  },
  bulkActionButton: {
    width: 56,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkActionPrimary: {
    flex: 1,
    height: 56,
    borderRadius: Radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulkActionText: {
    fontSize: 16,
    fontWeight: '700',
  },
});

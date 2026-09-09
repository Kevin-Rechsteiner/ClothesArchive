import { useCallback } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const SWIPE_THRESHOLD = 70;
const ACTION_WIDTH = 80;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

type LaundryStatus = 'im Wäschekorb' | 'in der Wäsche' | 'im Tumbler';

const STATUS_ORDER: (LaundryStatus | 'verfügbar')[] = [
  'im Wäschekorb',
  'in der Wäsche',
  'im Tumbler',
  'verfügbar',
];

const STATUS_LABELS: Record<string, string> = {
  'im Wäschekorb': 'Wäschekorb',
  'in der Wäsche': 'Waschmaschine',
  'im Tumbler': 'Tumbler',
  'verfügbar': 'Fertig',
};

function getNextStatus(current: LaundryStatus): LaundryStatus | 'verfügbar' {
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER[idx + 1] ?? 'verfügbar';
}

function getPrevStatus(current: LaundryStatus): LaundryStatus | null {
  const idx = STATUS_ORDER.indexOf(current);
  if (idx <= 0) return null;
  return STATUS_ORDER[idx - 1] as LaundryStatus;
}

type Props = {
  item: any;
  currentStatus: LaundryStatus;
  onRemove: (id: number) => void;
  onMoveForward: (id: number) => void;
  onMoveBack: (id: number) => void;
};

export function SwipeableLaundryItem({
  item,
  currentStatus,
  onRemove,
  onMoveForward,
  onMoveBack,
}: Props) {
  const { colors } = useAppTheme();
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const prevStatus = getPrevStatus(currentStatus);
  const nextStatus = getNextStatus(currentStatus);
  const nextLabel = STATUS_LABELS[nextStatus] ?? nextStatus;
  const prevLabel = prevStatus ? STATUS_LABELS[prevStatus] : null;

  const handleRemove = useCallback(() => {
    onRemove(item.id);
  }, [item.id, onRemove]);

  const handleMoveForward = useCallback(() => {
    onMoveForward(item.id);
  }, [item.id, onMoveForward]);

  const handleMoveBack = useCallback(() => {
    onMoveBack(item.id);
  }, [item.id, onMoveBack]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((e) => {
      const newX = contextX.value + e.translationX;
      // Right swipe: max ACTION_WIDTH (for remove)
      // Left swipe: max -(ACTION_WIDTH * 2) if has prevStatus, else -ACTION_WIDTH
      const maxLeft = prevStatus ? -(ACTION_WIDTH * 2) : -ACTION_WIDTH;
      translateX.value = Math.max(maxLeft, Math.min(ACTION_WIDTH, newX));
    })
    .onEnd((e) => {
      // Right swipe → remove
      if (e.translationX > SWIPE_THRESHOLD) {
        translateX.value = withTiming(ACTION_WIDTH, { duration: 200 });
      }
      // Left swipe → show actions
      else if (e.translationX < -SWIPE_THRESHOLD) {
        const target = prevStatus ? -(ACTION_WIDTH * 2) : -ACTION_WIDTH;
        translateX.value = withTiming(target, { duration: 200 });
      }
      // Snap back
      else {
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const animatedRowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Left actions (visible on left swipe) — behind the row on the right side
  const animatedLeftActions = useAnimatedStyle(() => ({
    opacity: translateX.value < -10 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 150 }),
  }));

  // Right action (visible on right swipe) — behind the row on the left side
  const animatedRightAction = useAnimatedStyle(() => ({
    opacity: translateX.value > 10 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 150 }),
  }));

  function executeAndReset(callback: () => void) {
    translateX.value = withSpring(0, SPRING_CONFIG);
    callback();
  }

  return (
    <View style={styles.outerContainer}>
      {/* Right action (remove) — appears when swiping right, sits behind on the left */}
      <Animated.View style={[styles.actionsRight, animatedRightAction]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.removeButton]}
          onPress={() => executeAndReset(handleRemove)}
        >
          <Text style={styles.actionButtonText}>
            ✕
          </Text>
          <Text style={styles.actionLabel}>
            Entfernen
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Left actions (move forward/back) — appears when swiping left, sits behind on the right */}
      <Animated.View style={[styles.actionsLeft, animatedLeftActions]}>
        {prevStatus && prevLabel && (
          <TouchableOpacity
            style={[styles.actionButton, styles.backButton]}
            onPress={() => executeAndReset(handleMoveBack)}
          >
            <Text style={styles.actionButtonText}>
              ◀
            </Text>
            <Text style={styles.actionLabel}>
              {prevLabel}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.forwardButton]}
          onPress={() => executeAndReset(handleMoveForward)}
        >
          <Text style={styles.actionButtonText}>
            ▶
          </Text>
          <Text style={styles.actionLabel}>
            {nextLabel}
          </Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Swipeable content row */}
      <GestureDetector gesture={pan}>
        <Animated.View
          style={[
            styles.clothItem,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
            animatedRowStyle,
          ]}
        >
          {item.photo_uri ? (
            <Image source={{ uri: item.photo_uri }} style={styles.photo} />
          ) : (
            <View style={[styles.photoPlaceholder, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={[styles.photoPlaceholderText, { color: colors.textMuted }]}>
                Kein Foto
              </Text>
            </View>
          )}
          <View style={styles.clothInfo}>
            <Text style={[styles.clothName, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.clothSub, { color: colors.textSecondary }]}>
              {item.category}
            </Text>
          </View>
          {item.color && (
            <View
              style={[
                styles.colorDot,
                {
                  backgroundColor: getColorValue(item.color),
                  borderColor: colors.border,
                },
              ]}
            />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

/** Map German color names to CSS colors for the dot indicator */
function getColorValue(colorName: string): string {
  const map: Record<string, string> = {
    'Schwarz': '#1A1A1A',
    'Weiss': '#F5F5F5',
    'Weiß': '#F5F5F5',
    'Blau': '#3B82F6',
    'Rot': '#EF4444',
    'Grün': '#22C55E',
    'Gelb': '#EAB308',
    'Grau': '#9CA3AF',
    'Braun': '#92400E',
    'Orange': '#F97316',
    'Rosa': '#EC4899',
    'Pink': '#EC4899',
    'Lila': '#A855F7',
    'Violett': '#8B5CF6',
    'Beige': '#D4C5A9',
    'Navy': '#1E3A5F',
    'Türkis': '#06B6D4',
    'Bordeaux': '#722F37',
    'Olive': '#808000',
    'Khaki': '#C3B091',
  };
  return map[colorName] ?? '#9CA3AF';
}

/** Check if a color name is considered "white" laundry */
export function isWhiteLaundry(colorName: string | null | undefined): boolean {
  if (!colorName) return false;
  const whites = ['weiss', 'weiß', 'white', 'beige', 'creme', 'crème', 'ecru'];
  return whites.includes(colorName.toLowerCase());
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  actionsRight: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
  },
  actionsLeft: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'flex-end',
  },
  actionButton: {
    width: ACTION_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
  },
  removeButton: {
    backgroundColor: '#DC2626',
  },
  forwardButton: {
    backgroundColor: '#2563EB',
  },
  backButton: {
    backgroundColor: '#7C3AED',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  clothItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  photo: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    resizeMode: 'cover',
  },
  photoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 9,
    fontWeight: '500',
  },
  clothInfo: {
    flex: 1,
  },
  clothName: {
    fontSize: 15,
    fontWeight: '600',
  },
  clothSub: {
    fontSize: 12,
    marginTop: 2,
  },
  colorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
  },
});

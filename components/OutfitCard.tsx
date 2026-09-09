import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useCallback } from 'react';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

const ACTION_WIDTH = 80;
const SWIPE_THRESHOLD = 60;
const SPRING_CONFIG = { damping: 20, stiffness: 200 };

type Props = {
  outfit: {
    id: number;
    name: string;
    items: any[];
    allAvailable: boolean;
    itemCount: number;
  };
  onPress: (id: number) => void;
  onDelete: (id: number) => void;
};

export function OutfitCard({ outfit, onPress, onDelete }: Props) {
  const { colors } = useAppTheme();
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const handleDelete = useCallback(() => {
    onDelete(outfit.id);
  }, [outfit.id, onDelete]);

  const pan = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .failOffsetY([-5, 5])
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((e) => {
      // Only allow left swipe for delete
      translateX.value = Math.max(-ACTION_WIDTH, Math.min(0, contextX.value + e.translationX));
    })
    .onEnd((e) => {
      if (e.translationX < -SWIPE_THRESHOLD) {
        translateX.value = withTiming(-ACTION_WIDTH, { duration: 200 });
      } else {
        translateX.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const deleteActionStyle = useAnimatedStyle(() => ({
    opacity: translateX.value < -10 ? withTiming(1, { duration: 150 }) : withTiming(0, { duration: 150 }),
  }));

  const availableCount = outfit.items.filter((i) => i.wash_status === 'verfügbar').length;

  return (
    <View style={styles.outerContainer}>
      {/* Delete action behind */}
      <Animated.View style={[styles.deleteAction, deleteActionStyle]}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            translateX.value = withSpring(0, SPRING_CONFIG);
            handleDelete();
          }}
        >
          <Text style={styles.deleteIcon}>X</Text>
          <Text style={styles.deleteLabel}>Löschen</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Main card */}
      <GestureDetector gesture={pan}>
        <Animated.View style={animatedStyle}>
          <TouchableOpacity
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={() => onPress(outfit.id)}
            activeOpacity={0.85}
          >
            {/* Thumbnails row */}
            <View style={styles.thumbnails}>
              {outfit.items.slice(0, 4).map((item, index) => (
                <View key={item.id} style={[styles.thumbWrap, index > 0 && styles.thumbOverlap]}>
                  {item.photo_uri ? (
                    <Image source={{ uri: item.photo_uri }} style={styles.thumb} />
                  ) : (
                    <View style={[styles.thumbPlaceholder, { backgroundColor: colors.surfaceMuted }]}>
                      <Text style={{ fontSize: 10, color: colors.textMuted }}>
                        {item.name?.charAt(0) ?? '?'}
                      </Text>
                    </View>
                  )}
                </View>
              ))}
              {outfit.itemCount > 4 && (
                <View style={[styles.thumbWrap, styles.thumbOverlap]}>
                  <View style={[styles.thumbMore, { backgroundColor: colors.accentSoft }]}>
                    <Text style={[styles.thumbMoreText, { color: colors.accent }]}>
                      +{outfit.itemCount - 4}
                    </Text>
                  </View>
                </View>
              )}
              {outfit.itemCount === 0 && (
                <View style={[styles.thumbPlaceholder, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={{ fontSize: 10, color: colors.textMuted }}>Leer</Text>
                </View>
              )}
            </View>

            {/* Info */}
            <View style={styles.info}>
              <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {outfit.name}
              </Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {outfit.itemCount} Teile
              </Text>
            </View>

            {/* Availability badge */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: outfit.itemCount === 0
                    ? colors.surfaceMuted
                    : outfit.allAvailable
                    ? '#E6F2EC'
                    : '#FCEEEA',
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: outfit.itemCount === 0
                      ? colors.textMuted
                      : outfit.allAvailable
                      ? '#3D8B5F'
                      : '#C45C4A',
                  },
                ]}
              >
                {outfit.itemCount === 0
                  ? '–'
                  : outfit.allAvailable
                  ? `✓ Bereit`
                  : `${availableCount}/${outfit.itemCount}`}
              </Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: Radius.lg,
    marginBottom: Spacing.md,
  },
  deleteAction: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
  },
  deleteButton: {
    width: ACTION_WIDTH,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: Radius.lg,
    borderBottomRightRadius: Radius.lg,
  },
  deleteIcon: {
    fontSize: 20,
    marginBottom: 2,
  },
  deleteLabel: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  thumbnails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  thumbOverlap: {
    marginLeft: -10,
  },
  thumb: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  thumbPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbMore: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbMoreText: {
    fontSize: 11,
    fontWeight: '700',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});

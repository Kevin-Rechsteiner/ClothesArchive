import { StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useAppTheme } from '@/hooks/use-app-theme';

type FilterChipProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
  style?: ViewStyle;
};

export function FilterChip({ label, active = false, onPress, style }: FilterChipProps) {
  const { colors } = useAppTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accent : colors.surface,
          borderColor: active ? colors.accent : colors.border,
        },
        style,
      ]}
      activeOpacity={0.75}
    >
      <Text
        style={[
          styles.label,
          { color: active ? colors.accentText : colors.textSecondary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});

import { Platform } from 'react-native';

const tintColorLight = '#2C4A3E';
const tintColorDark = '#A8C4B8';

export const Colors = {
  light: {
    text: '#1A1A18',
    background: '#FAFAF8',
    tint: tintColorLight,
    icon: '#6B6963',
    tabIconDefault: '#8A8780',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#F2F0EB',
    background: '#121412',
    tint: tintColorDark,
    icon: '#A8A49C',
    tabIconDefault: '#7A7770',
    tabIconSelected: tintColorDark,
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const AppPalette = {
  light: {
    background: '#FAFAF8',
    surface: '#FFFFFF',
    surfaceMuted: '#F3F2EF',
    surfaceElevated: '#FFFFFF',
    border: '#E8E6E1',
    borderStrong: '#D4D0C8',
    text: '#1A1A18',
    textSecondary: '#6B6963',
    textMuted: '#9C9890',
    accent: '#2C4A3E',
    accentSoft: '#E8EFEB',
    accentText: '#FFFFFF',
    success: '#3D8B5F',
    successSoft: '#E6F2EC',
    danger: '#C45C4A',
    dangerSoft: '#FCEEEA',
    warning: '#B8860B',
    warningSoft: '#FBF3E0',
    tabBar: '#FFFFFF',
    tabBarBorder: '#E8E6E1',
    overlay: 'rgba(26, 26, 24, 0.45)',
    shadow: '#1A1A18',
  },
  dark: {
    background: '#121412',
    surface: '#1C1F1D',
    surfaceMuted: '#252926',
    surfaceElevated: '#2A2E2B',
    border: '#333632',
    borderStrong: '#454842',
    text: '#F2F0EB',
    textSecondary: '#B8B4AC',
    textMuted: '#7A7770',
    accent: '#A8C4B8',
    accentSoft: '#243028',
    accentText: '#121412',
    success: '#6BBF8A',
    successSoft: '#1E2E24',
    danger: '#E07A68',
    dangerSoft: '#2E1E1A',
    warning: '#D4A843',
    warningSoft: '#2A2418',
    tabBar: '#1C1F1D',
    tabBarBorder: '#333632',
    overlay: 'rgba(0, 0, 0, 0.6)',
    shadow: '#000000',
  },
} as const;

const UNAVAILABLE_STATUSES = ['nicht verfügbar', 'im Wäschekorb', 'in der Wäsche', 'im Tumbler'];

export function isClothAvailable(status: string) {
  return !UNAVAILABLE_STATUSES.includes(status);
}

export function getStatusTheme(status: string, scheme: 'light' | 'dark' = 'light') {
  const colors = AppPalette[scheme];

  if (status === 'verfügbar') {
    return { label: 'Verfügbar', color: colors.success, background: colors.successSoft };
  }

  const labels: Record<string, string> = {
    'im Wäschekorb': 'Wäschekorb',
    'in der Wäsche': 'In der Wäsche',
    'im Tumbler': 'Im Tumbler',
    'nicht verfügbar': 'Nicht verfügbar',
  };

  return {
    label: labels[status] ?? status,
    color: colors.danger,
    background: colors.dangerSoft,
  };
}

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

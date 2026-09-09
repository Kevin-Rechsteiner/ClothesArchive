import { AppPalette, Colors } from '@/constants/theme';
import { useThemeMode } from '@/hooks/theme-context';

export function useAppTheme() {
  const { scheme } = useThemeMode();
  const safeScheme = scheme === 'dark' ? 'dark' : 'light';
  const colors = AppPalette[safeScheme];
  const navigation = Colors[safeScheme];

  return {
    scheme: safeScheme,
    isDark: safeScheme === 'dark',
    colors,
    navigation,
  };
}

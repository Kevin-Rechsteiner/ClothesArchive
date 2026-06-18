import { AppPalette, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useAppTheme() {
  const scheme = useColorScheme() ?? 'light';

  return {
    scheme,
    isDark: scheme === 'dark',
    colors: AppPalette[scheme],
    navigation: Colors[scheme],
  };
}

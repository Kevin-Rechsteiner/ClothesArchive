import { initDatabase } from '@/db/database';
import { ThemeProvider as AppThemeProvider, useThemeMode } from '@/hooks/theme-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

initDatabase();

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppStack() {
  const { scheme } = useThemeMode();

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ title:'Übersicht', headerShown: false }} />
        <Stack.Screen name="modal" options={{ title: '', headerShown: false }} />
        <Stack.Screen name="clothes/edit/[id]" options={{ title: 'Bearbeiten' }} />
        <Stack.Screen name="clothes/[id]" options={{ title: 'Details' }} />
        <Stack.Screen name="add-clothes" options={{ title: 'Neu' }} />
        <Stack.Screen name="outfits/[id]" options={{ title: 'Outfit', headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AppStack />
    </AppThemeProvider>
  );
}

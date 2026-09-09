import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import db from '@/db/database';

type ThemeMode = 'light' | 'dark';

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'light' || value === 'dark';
}

type ThemeContextType = {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  scheme: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextType>({
  mode: 'light',
  setMode: () => {},
  scheme: 'light',
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  // Load saved preference on mount
  useEffect(() => {
    const row = db.getFirstSync('SELECT value FROM settings WHERE key = ?', ['theme_mode']) as any;
    if (row && isThemeMode(row.value)) {
      setModeState(row.value);
    }
  }, []);

  function setMode(newMode: ThemeMode) {
    setModeState(newMode);
    db.runSync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['theme_mode', newMode]);
  }

  const scheme = mode;

  return (
    <ThemeContext.Provider value={{ mode, setMode, scheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  return useContext(ThemeContext);
}

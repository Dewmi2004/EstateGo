// src/theme/useThemeColors.ts
// Resolves the active color palette from the user's theme setting
// ('light' | 'dark' | 'system') plus the device's system color scheme.
// Import this instead of the static `colors` export anywhere the UI
// should respond to dark mode.

import { useColorScheme } from 'react-native';
import { useAppSelector } from '@/hooks/redux';
import { getColors, AppColors } from './colors';

export function useIsDarkMode(): boolean {
  const themeMode = useAppSelector((state) => state.settings.themeMode);
  const systemScheme = useColorScheme();
  if (themeMode === 'system') {
    return systemScheme === 'dark';
  }
  return themeMode === 'dark';
}

export function useThemeColors(): AppColors {
  const isDark = useIsDarkMode();
  return getColors(isDark ? 'dark' : 'light');
}

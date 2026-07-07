// src/theme/colors.ts
// Central color palettes for EstateGo — one for light mode, one for dark.
// Both share the same keys, so every screen/component can stay written
// against `colors.xxx` and simply receive whichever palette is active via
// the `useThemeColors()` hook (see useThemeColors.ts).

interface Palette {
  mode: 'light' | 'dark';
  primary: string;
  primaryLight: string;
  accent: string;
  accentLight: string;
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  textMuted: string;
  textInverse: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  overlay: string;
}

const lightColors: Palette = {
  mode: 'light',

  primary: '#0B1F3A',
  primaryLight: '#16305A',
  accent: '#D4A24C',
  accentLight: '#E8C77E',

  background: '#F5F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEF0F5',

  text: '#1B1F27',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  border: '#E2E5EB',

  success: '#2E9E5B',
  error: '#D6463C',
  warning: '#E0A82E',

  overlay: 'rgba(11, 31, 58, 0.55)',
};

const darkColors: Palette = {
  mode: 'dark',

  primary: '#3E6BC2',
  primaryLight: '#5580D1',
  accent: '#E8C77E',
  accentLight: '#F2DBA3',

  background: '#0E1117',
  surface: '#171B24',
  surfaceAlt: '#1F2430',

  text: '#EDEEF2',
  textMuted: '#9AA1AE',
  textInverse: '#0E1117',

  border: '#2A2F3B',

  success: '#3FBB74',
  error: '#E5695F',
  warning: '#E8BE55',

  overlay: 'rgba(0, 0, 0, 0.65)',
};

export type AppColors = Palette;
export type ThemeMode = 'light' | 'dark' | 'system';

export const palettes: Record<'light' | 'dark', AppColors> = {
  light: lightColors,
  dark: darkColors,
};

export function getColors(scheme: 'light' | 'dark'): AppColors {
  return palettes[scheme];
}

// Legacy static export — kept so any file that still imports `colors`
// directly (rather than via useThemeColors()) doesn't crash the build.
// Prefer useThemeColors() in all new/updated code so colors respond to
// the user's theme setting.
export const colors = lightColors;

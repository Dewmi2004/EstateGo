// src/theme/theme.ts
import { MD3LightTheme, MD3DarkTheme, configureFonts } from 'react-native-paper';
import { AppColors, colors as lightColors } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

function buildTheme(base: typeof MD3LightTheme, colors: AppColors) {
  return {
    ...base,
    fonts: configureFonts({ config: fontConfig }),
    colors: {
      ...base.colors,
      primary: colors.primary,
      secondary: colors.accent,
      background: colors.background,
      surface: colors.surface,
      surfaceVariant: colors.surfaceAlt,
      error: colors.error,
      onSurface: colors.text,
      onSurfaceVariant: colors.textMuted,
      outline: colors.border,
    },
    roundness: 12,
  };
}

// Given the active palette, returns the matching react-native-paper theme
// (dark base theme for dark palettes so Paper's own components — menus,
// switches, dialogs — pick sensible defaults too).
export function getAppTheme(colors: AppColors) {
  return buildTheme(colors.mode === 'dark' ? MD3DarkTheme : MD3LightTheme, colors);
}

// Legacy static export (light theme) — kept for any leftover static usage.
export const appTheme = buildTheme(MD3LightTheme, lightColors);

export type AppTheme = ReturnType<typeof getAppTheme>;

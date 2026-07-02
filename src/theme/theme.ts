// src/theme/theme.ts
import { MD3LightTheme, configureFonts } from 'react-native-paper';
import { colors } from './colors';

const fontConfig = {
  fontFamily: 'System',
};

export const appTheme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    secondary: colors.accent,
    background: colors.background,
    surface: colors.surface,
    error: colors.error,
    onSurface: colors.text,
    outline: colors.border,
  },
  roundness: 12,
};

export type AppTheme = typeof appTheme;

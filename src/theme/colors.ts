// src/theme/colors.ts
// Central color palette for EstateGo. Change values here to re-theme the whole app.

export const colors = {
  primary: '#0B1F3A',
  primaryLight: '#16305A',
  accent: '#D4A24C',
  accentLight: '#E8C77E',

  background: '#F5F6FA',
  surface: '#FFFFFF',

  text: '#1B1F27',
  textMuted: '#6B7280',
  textInverse: '#FFFFFF',

  border: '#E2E5EB',

  success: '#2E9E5B',
  error: '#D6463C',
  warning: '#E0A82E',

  overlay: 'rgba(11, 31, 58, 0.55)',
};

export type AppColors = typeof colors;

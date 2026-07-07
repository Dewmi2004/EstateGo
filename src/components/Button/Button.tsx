// src/components/Button/Button.tsx

import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import { Button as PaperButton } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { moderateScale } from '@/utils/responsive';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  mode?: 'contained' | 'outlined' | 'text';
  color?: string;
  textColor?: string;
  style?: ViewStyle;
  testID?: string;
}

export default function Button({
  label,
  onPress,
  loading = false,
  disabled = false,
  mode = 'contained',
  color,
  textColor,
  style,
  testID,
}: AppButtonProps) {
  const colors = useThemeColors();
  return (
    <PaperButton
      mode={mode}
      onPress={onPress}
      loading={loading}
      disabled={disabled || loading}
      style={[styles.button, style]}
      contentStyle={styles.content}
      labelStyle={styles.label}
      buttonColor={mode === 'contained' ? (color ?? colors.primary) : undefined}
      textColor={textColor ?? (mode === 'contained' ? colors.textInverse : colors.primary)}
      testID={testID}
    >
      {label}
    </PaperButton>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    width: '100%',
  },
  content: {
    height: moderateScale(50),
  },
  label: {
    fontSize: moderateScale(15),
    fontWeight: '600',
  },
});

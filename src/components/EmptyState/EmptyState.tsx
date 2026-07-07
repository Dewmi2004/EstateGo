// src/components/EmptyState/EmptyState.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface EmptyStateProps {
  icon: string;
  title: string;
  description?: string;
}

export default function EmptyState({ icon, title, description }: EmptyStateProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon source={icon} size={28} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: moderateScale(48),
    paddingHorizontal: moderateScale(24),
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  description: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    textAlign: 'center',
  },
});

// src/components/CTABanner/CTABanner.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import Button from '@/components/Button/Button';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface CTABannerProps {
  title: string;
  description: string;
  buttonLabel: string;
  onPress?: () => void;
}

export default function CTABanner({ title, description, buttonLabel, onPress }: CTABannerProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Icon source="home-plus-outline" size={26} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <Button
        label={buttonLabel}
        mode="contained"
        onPress={onPress ?? (() => {})}
        color={colors.accent}
        textColor={colors.primary}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: moderateScale(20),
    alignItems: 'center',
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h2),
    color: colors.textInverse,
    textAlign: 'center',
    marginBottom: 6,
  },
  description: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.accentLight,
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: moderateScale(18),
  },
  button: {
    backgroundColor: colors.accent,
  },
});

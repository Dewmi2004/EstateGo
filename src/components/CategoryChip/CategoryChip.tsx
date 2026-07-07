// src/components/CategoryChip/CategoryChip.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { Category } from '@/types/property.types';

interface CategoryChipProps {
  category: Category;
  active?: boolean;
  onPress?: () => void;
}

export default function CategoryChip({ category, active = false, onPress }: CategoryChipProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity style={styles.wrapper} activeOpacity={0.8} onPress={onPress}>
      <View style={[styles.iconCircle, active && styles.iconCircleActive]}>
        <Icon source={category.icon} size={22} color={active ? colors.textInverse : colors.primary} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {category.label}
      </Text>
      <Text style={styles.count}>{category.count.toLocaleString()}+</Text>
    </TouchableOpacity>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: moderateScale(76),
  },
  iconCircle: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.caption),
    color: colors.text,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    marginTop: 1,
  },
});

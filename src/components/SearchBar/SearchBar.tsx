// src/components/SearchBar/SearchBar.tsx
// The floating search pill that sits inside the hero card. Not a full search
// screen yet (that's Day 4) — tapping it is wired for navigation later.

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface SearchBarProps {
  onPress?: () => void;
  placeholder?: string;
}

export default function SearchBar({ onPress, placeholder = 'Search by location, e.g. Gulshan' }: SearchBarProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.85} onPress={onPress}>
      <Icon source="magnify" size={20} color={colors.textMuted} />
      <Text style={styles.placeholder} numberOfLines={1}>
        {placeholder}
      </Text>
      <View style={styles.searchButton}>
        <Icon source="tune-variant" size={16} color={colors.textInverse} />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(14),
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  placeholder: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: moderateScale(type.body),
    color: colors.textMuted,
  },
  searchButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

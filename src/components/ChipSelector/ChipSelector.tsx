// src/components/ChipSelector/ChipSelector.tsx
// Generic single-select chip row. Used for property type, status, and
// bedroom-count pickers in the Add/Edit Property form and list filters.

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface ChipOption<T extends string> {
  label: string;
  value: T;
}

interface ChipSelectorProps<T extends string> {
  label?: string;
  options: ChipOption<T>[];
  value: T | undefined;
  onChange: (value: T) => void;
}

export default function ChipSelector<T extends string>({ label, options, value, onChange }: ChipSelectorProps<T>) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.chip, active && styles.chipActive]}
              activeOpacity={0.8}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    marginBottom: 8,
  },
  row: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.caption),
    color: colors.text,
  },
  chipTextActive: {
    color: colors.textInverse,
  },
});

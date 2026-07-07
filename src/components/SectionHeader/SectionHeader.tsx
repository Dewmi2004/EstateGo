// src/components/SectionHeader/SectionHeader.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}

export default function SectionHeader({ eyebrow, title, actionLabel, onActionPress }: SectionHeaderProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {actionLabel ? (
        <TouchableOpacity style={styles.actionRow} onPress={onActionPress} hitSlop={8}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
          <Icon source="arrow-right" size={14} color={colors.primary} />
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  textCol: {
    flexShrink: 1,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.micro),
    color: colors.accent,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  title: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h2),
    color: colors.text,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.caption),
    color: colors.primary,
  },
});

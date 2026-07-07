// src/components/StatBadge/StatBadge.tsx
// The floating trust strip that bridges the hero card and the page body —
// this overlap is the app's signature motif, echoed by the price tag overlap
// on PropertyCard.

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface Stat {
  id: string;
  value: string;
  label: string;
}

interface StatBadgeProps {
  stats: Stat[];
}

export default function StatBadge({ stats }: StatBadgeProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <React.Fragment key={stat.id}>
          <View style={styles.item}>
            <Text style={styles.value}>{stat.value}</Text>
            <Text style={styles.label}>{stat.label}</Text>
          </View>
          {index < stats.length - 1 && <View style={styles.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingVertical: moderateScale(14),
    paddingHorizontal: moderateScale(10),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
  },
  value: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h2),
    color: colors.primary,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.micro),
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: colors.border,
    marginVertical: 2,
  },
});

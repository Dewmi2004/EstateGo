// src/screens/auth/SplashScreen.tsx
// Runs bootstrapAuth once on mount. RootNavigator watches isBootstrapping/isAuthenticated
// and switches stacks automatically once this resolves - no manual navigation needed here.

import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { useAppDispatch } from '@/hooks/redux';
import { bootstrapAuth } from '@/redux/auth/authSlice';

export default function SplashScreen() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>EstateGo</Text>
      <Text style={styles.tagline}>Find your next home, intelligently.</Text>
      <ActivityIndicator
        animating
        color={colors.accent}
        size="large"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logo: {
    fontSize: moderateScale(38),
    fontFamily: fonts.displayBold,
    color: colors.textInverse,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: moderateScale(14),
    fontFamily: fonts.body,
    color: colors.accentLight,
    marginTop: 8,
    textAlign: 'center',
  },
  spinner: {
    marginTop: 32,
  },
});

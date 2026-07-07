// src/screens/profile/ProfileScreen.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Avatar, Divider, Icon } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '@/components/Button/Button';
import Loader from '@/components/Loader/Loader';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { moderateScale } from '@/utils/responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logoutUser } from '@/redux/auth/authSlice';
import { useTranslation } from '@/i18n/i18n';
import type { ProfileStackParamList } from '@/navigation/ProfileNavigator';

export default function ProfileScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={72}
          label={user?.name?.charAt(0)?.toUpperCase() ?? '?'}
          style={{ backgroundColor: colors.primary }}
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{t('profile.memberSince')}</Text>
        <Text style={styles.infoValue}>
          {user?.createdAt ? new Date(user.createdAt).toDateString() : '-'}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.settingsRow}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Settings')}
        testID="open-settings"
      >
        <View style={styles.settingsRowLeft}>
          <Icon source="cog-outline" size={20} color={colors.text} />
          <Text style={styles.settingsRowLabel}>{t('profile.settings')}</Text>
        </View>
        <Icon source="chevron-right" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <Button
        label={t('profile.logOut')}
        mode="outlined"
        onPress={() => dispatch(logoutUser())}
        style={styles.logoutButton}
        testID="logout-button"
      />
      <Loader visible={isLoading} label={t('profile.loggingOut')} />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
    },
    profileHeader: {
      alignItems: 'center',
      marginTop: 12,
      marginBottom: 20,
      gap: 6,
    },
    name: {
      fontSize: moderateScale(19),
      fontWeight: '700',
      color: colors.text,
      marginTop: 8,
    },
    email: {
      fontSize: moderateScale(13),
      color: colors.textMuted,
    },
    divider: {
      marginVertical: 16,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    infoLabel: {
      color: colors.textMuted,
      fontSize: moderateScale(13),
    },
    infoValue: {
      color: colors.text,
      fontSize: moderateScale(13),
      fontWeight: '600',
    },
    settingsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      paddingHorizontal: 4,
      marginTop: 8,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    settingsRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    settingsRowLabel: {
      fontSize: moderateScale(14),
      fontWeight: '600',
      color: colors.text,
    },
    logoutButton: {
      marginTop: 24,
    },
  });

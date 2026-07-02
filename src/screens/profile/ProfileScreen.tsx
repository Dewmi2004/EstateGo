// src/screens/profile/ProfileScreen.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import Button from '@/components/Button/Button';
import Loader from '@/components/Loader/Loader';
import { colors } from '@/theme/colors';
import { moderateScale } from '@/utils/responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { logoutUser } from '@/redux/auth/authSlice';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAppSelector((state) => state.auth);

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
        <Text style={styles.infoLabel}>Member since</Text>
        <Text style={styles.infoValue}>
          {user?.createdAt ? new Date(user.createdAt).toDateString() : '-'}
        </Text>
      </View>

      <Button
        label="Log Out"
        mode="outlined"
        onPress={() => dispatch(logoutUser())}
        style={styles.logoutButton}
        testID="logout-button"
      />
      <Loader visible={isLoading} label="Logging out..." />
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoutButton: {
    marginTop: 24,
  },
});

// src/navigation/ProfileNavigator.tsx
// Stack nested inside the "Profile" tab: profile home -> settings.
// Kept separate from MainNavigator's tab bar so Settings doesn't show up
// as its own tab.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import { useThemeColors } from '@/theme/useThemeColors';
import { fonts } from '@/theme/typography';
import { useTranslation } from '@/i18n/i18n';

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export default function ProfileNavigator() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: fonts.bodySemiBold },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: t('settings.title') }} />
    </Stack.Navigator>
  );
}

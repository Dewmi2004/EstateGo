// src/navigation/MainNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import HomeScreen from '@/screens/home/HomeScreen';
import ProfileNavigator from './ProfileNavigator';
import PropertyNavigator from './PropertyNavigator';
import FavoritesScreen from '@/screens/property/FavoritesScreen';
import ChatbotScreen from '@/screens/chatbot/ChatbotScreen';
import { useThemeColors } from '@/theme/useThemeColors';
import { fonts } from '@/theme/typography';
import { useTranslation } from '@/i18n/i18n';

export type MainTabParamList = {
  Home: undefined;
  PropertiesTab: undefined;
  FavoritesTab: undefined;
  ChatbotTab: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  const colors = useThemeColors();
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Icon source="home-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="PropertiesTab"
        component={PropertyNavigator}
        options={{
          title: t('tabs.properties'),
          tabBarIcon: ({ color, size }) => <Icon source="office-building-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          title: t('tabs.favorites'),
          tabBarIcon: ({ color, size }) => <Icon source="heart-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ChatbotTab"
        component={ChatbotScreen}
        options={{
          title: t('tabs.chatbot'),
          tabBarIcon: ({ color, size }) => <Icon source="robot-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Icon source="account-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

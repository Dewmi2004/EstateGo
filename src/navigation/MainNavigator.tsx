// src/navigation/MainNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Icon } from 'react-native-paper';
import HomeScreen from '@/screens/home/HomeScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import PropertyNavigator from './PropertyNavigator';
import FavoritesScreen from '@/screens/property/FavoritesScreen';
import ChatbotScreen from '@/screens/chatbot/ChatbotScreen';
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';

export type MainTabParamList = {
  Home: undefined;
  PropertiesTab: undefined;
  FavoritesTab: undefined;
  ChatbotTab: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 6 },
        tabBarLabelStyle: { fontFamily: fonts.bodyMedium, fontSize: 11 },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon source="home-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="PropertiesTab"
        component={PropertyNavigator}
        options={{
          title: 'Properties',
          tabBarIcon: ({ color, size }) => <Icon source="office-building-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="FavoritesTab"
        component={FavoritesScreen}
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, size }) => <Icon source="heart-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="ChatbotTab"
        component={ChatbotScreen}
        options={{
          title: 'EstateBot',
          tabBarIcon: ({ color, size }) => <Icon source="robot-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Icon source="account-outline" color={color} size={size} />,
        }}
      />
    </Tab.Navigator>
  );
}

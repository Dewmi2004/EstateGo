// src/services/notifications/notificationService.ts
// Thin wrapper around expo-notifications. Handles permission requests and
// sends local (on-device) notifications for the three categories EstateGo
// cares about: new property alerts, payment updates, and EstateBot replies.
//
// This is local-notification only (no push server / remote token flow) —
// enough for in-app alerts like "Payment confirmed" or "New listing near
// you" without needing any backend changes.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationSettings } from '@/redux/settings/settingsSlice';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const existing = await Notifications.getPermissionsAsync();
  let status = existing.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'EstateGo',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return status === 'granted';
}

type Category = keyof Omit<NotificationSettings, 'enabled'>;

// Sends a local notification, but only if the user has both the master
// toggle and the relevant category enabled in Settings.
export async function sendLocalNotification(
  settings: NotificationSettings,
  category: Category,
  title: string,
  body: string
): Promise<void> {
  if (!settings.enabled || !settings[category]) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger: null, // fire immediately
  });
}

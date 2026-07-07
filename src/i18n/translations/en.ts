// src/i18n/translations/en.ts
export const en = {
  tabs: {
    home: 'Home',
    properties: 'Properties',
    favorites: 'Favorites',
    chatbot: 'EstateBot',
    profile: 'Profile',
  },
  profile: {
    memberSince: 'Member since',
    settings: 'Settings',
    logOut: 'Log Out',
    loggingOut: 'Logging out...',
  },
  settings: {
    title: 'Settings',
    appearance: 'Appearance',
    appearanceHint: 'Choose how EstateGo looks on this device.',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    language: 'Language',
    languageHint: 'Choose the language used across the app.',
    notifications: 'Notifications',
    notificationsHint: 'Control which alerts EstateGo can send you.',
    notificationsEnabled: 'Allow notifications',
    propertyAlerts: 'New property alerts',
    propertyAlertsHint: 'Listings matching your interests',
    paymentUpdates: 'Payment updates',
    paymentUpdatesHint: 'Order confirmations and receipts',
    chatMessages: 'EstateBot messages',
    chatMessagesHint: 'Replies from the assistant',
    permissionDenied: 'Notification permission was denied. You can enable it from your device settings.',
    testNotificationSent: 'Test notification sent',
  },
  alerts: {
    paymentSuccessTitle: 'Payment successful',
    paymentSuccessBody: 'Your listing payment was confirmed and the property is now live.',
    chatReplyTitle: 'EstateBot',
    testTitle: 'EstateGo',
    testBody: 'Notifications are working correctly.',
  },
};

export type TranslationDict = typeof en;

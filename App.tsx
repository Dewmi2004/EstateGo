// App.tsx

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '@/redux/store';
import { getAppTheme } from '@/theme/theme';
import { useThemeColors, useIsDarkMode } from '@/theme/useThemeColors';
import { useAppFonts } from '@/hooks/useAppFonts';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { hydrateSettings } from '@/redux/settings/settingsSlice';
import { requestNotificationPermission } from '@/services/notifications/notificationService';
import RootNavigator from '@/navigation/RootNavigator';

function AppContent() {
  const colors = useThemeColors();
  const isDark = useIsDarkMode();
  const dispatch = useAppDispatch();
  const { isHydrated, notifications } = useAppSelector((state) => state.settings);

  useEffect(() => {
    dispatch(hydrateSettings());
  }, [dispatch]);

  useEffect(() => {
    if (isHydrated && notifications.enabled) {
      requestNotificationPermission();
    }
  }, [isHydrated, notifications.enabled]);

  return (
    <PaperProvider theme={getAppTheme(colors)}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <RootNavigator />
    </PaperProvider>
  );
}

function AppRoot() {
  const fontsLoaded = useAppFonts();
  const colors = useThemeColors();

  if (!fontsLoaded) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.primary }]}>
        <ActivityIndicator color={colors.accent} size="large" />
      </View>
    );
  }

  // Native (Android/iOS): render full-screen as normal.
  if (Platform.OS !== 'web') {
    return <AppContent />;
  }

  // Web: contain the app in a phone-sized frame instead of letting it
  // stretch across the whole browser window like a desktop site.
  const windowHeight = Dimensions.get('window').height;
  const frameHeight = Math.min(windowHeight - 48, 880);

  return (
    <View style={styles.webOuter}>
      <View style={[styles.webFrame, { height: frameHeight, backgroundColor: colors.background }]}>
        <AppContent />
      </View>
    </View>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <AppRoot />
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webOuter: {
    flex: 1,
    backgroundColor: '#11141B',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  webFrame: {
    width: 420,
    maxWidth: '100%',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 10,
    borderColor: '#0B0D12',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
});

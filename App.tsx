// App.tsx

if (__DEV__) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@/services/msw/mockServer').startMockServer();
}

import React from 'react';
import { View, ActivityIndicator, StyleSheet, Platform, Dimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store } from '@/redux/store';
import { appTheme } from '@/theme/theme';
import { colors } from '@/theme/colors';
import { useAppFonts } from '@/hooks/useAppFonts';
import RootNavigator from '@/navigation/RootNavigator';

function AppContent() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Provider store={store}>
          <PaperProvider theme={appTheme}>
            <StatusBar style="light" />
            <RootNavigator />
          </PaperProvider>
        </Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
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
      <View style={[styles.webFrame, { height: frameHeight }]}>
        <AppContent />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.background,
    borderWidth: 10,
    borderColor: '#0B0D12',
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 40,
    shadowOffset: { width: 0, height: 20 },
    elevation: 20,
  },
});
// src/redux/settings/settingsSlice.ts
// App-wide preferences: theme mode, language, and notification toggles.
// Persisted to AsyncStorage so choices survive an app restart.

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from '@/theme/colors';
import type { LanguageCode } from '@/i18n/i18n';

const SETTINGS_STORAGE_KEY = '@estategoNumbergo/settings';

export interface NotificationSettings {
  enabled: boolean;
  propertyAlerts: boolean;
  paymentUpdates: boolean;
  chatMessages: boolean;
}

export interface SettingsState {
  themeMode: ThemeMode;
  language: LanguageCode;
  notifications: NotificationSettings;
  isHydrated: boolean;
}

const initialState: SettingsState = {
  themeMode: 'system',
  language: 'en',
  notifications: {
    enabled: true,
    propertyAlerts: true,
    paymentUpdates: true,
    chatMessages: true,
  },
  isHydrated: false,
};

type PersistedSettings = Omit<SettingsState, 'isHydrated'>;

async function persist(state: SettingsState): Promise<void> {
  const { isHydrated, ...toStore } = state;
  await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toStore));
}

// Runs once on app launch to restore saved preferences.
export const hydrateSettings = createAsyncThunk<PersistedSettings | null>(
  'settings/hydrate',
  async () => {
    const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as PersistedSettings;
    } catch {
      return null;
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setThemeMode: (state, action: PayloadAction<ThemeMode>) => {
      state.themeMode = action.payload;
      persist(state);
    },
    setLanguage: (state, action: PayloadAction<LanguageCode>) => {
      state.language = action.payload;
      persist(state);
    },
    setNotificationsEnabled: (state, action: PayloadAction<boolean>) => {
      state.notifications.enabled = action.payload;
      persist(state);
    },
    toggleNotificationCategory: (
      state,
      action: PayloadAction<keyof Omit<NotificationSettings, 'enabled'>>
    ) => {
      state.notifications[action.payload] = !state.notifications[action.payload];
      persist(state);
    },
  },
  extraReducers: (builder) => {
    builder.addCase(hydrateSettings.fulfilled, (state, action) => {
      if (action.payload) {
        state.themeMode = action.payload.themeMode ?? state.themeMode;
        state.language = action.payload.language ?? state.language;
        state.notifications = {
          ...state.notifications,
          ...action.payload.notifications,
        };
      }
      state.isHydrated = true;
    });
  },
});

export const {
  setThemeMode,
  setLanguage,
  setNotificationsEnabled,
  toggleNotificationCategory,
} = settingsSlice.actions;

export default settingsSlice.reducer;

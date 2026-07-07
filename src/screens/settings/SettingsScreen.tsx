// src/screens/settings/SettingsScreen.tsx

import React, { useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, Switch, Divider, Icon } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useTranslation } from '@/i18n/i18n';
import { languages, LanguageCode } from '@/i18n/i18n';
import type { ThemeMode } from '@/theme/colors';
import {
  setThemeMode,
  setLanguage,
  setNotificationsEnabled,
  toggleNotificationCategory,
} from '@/redux/settings/settingsSlice';
import {
  requestNotificationPermission,
  sendLocalNotification,
} from '@/services/notifications/notificationService';

export default function SettingsScreen() {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { themeMode, language, notifications } = useAppSelector((state) => state.settings);
  const [sendingTest, setSendingTest] = useState(false);

  const themeOptions: { value: ThemeMode; label: string; icon: string }[] = [
    { value: 'light', label: t('settings.light'), icon: 'white-balance-sunny' },
    { value: 'dark', label: t('settings.dark'), icon: 'moon-waning-crescent' },
    { value: 'system', label: t('settings.system'), icon: 'cellphone-cog' },
  ];

  const handleNotificationsToggle = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(t('settings.notifications'), t('settings.permissionDenied'));
        dispatch(setNotificationsEnabled(false));
        return;
      }
    }
    dispatch(setNotificationsEnabled(value));
  };

  const handleSendTest = async () => {
    setSendingTest(true);
    try {
      await sendLocalNotification(
        { ...notifications, enabled: true },
        'propertyAlerts',
        'EstateGo',
        t('settings.testNotificationSent')
      );
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      {/* Appearance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.appearance')}</Text>
        <Text style={styles.sectionHint}>{t('settings.appearanceHint')}</Text>
        <View style={styles.optionRow}>
          {themeOptions.map((option) => {
            const active = themeMode === option.value;
            return (
              <TouchableOpacity
                key={option.value}
                style={[styles.optionCard, active && styles.optionCardActive]}
                activeOpacity={0.85}
                onPress={() => dispatch(setThemeMode(option.value))}
                testID={`theme-option-${option.value}`}
              >
                <Icon
                  source={option.icon}
                  size={22}
                  color={active ? colors.textInverse : colors.text}
                />
                <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Language */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <Text style={styles.sectionHint}>{t('settings.languageHint')}</Text>
        <View style={styles.languageList}>
          {languages.map((lang) => {
            const active = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                style={[styles.languageRow, active && styles.languageRowActive]}
                activeOpacity={0.85}
                onPress={() => dispatch(setLanguage(lang.code as LanguageCode))}
                testID={`language-option-${lang.code}`}
              >
                <View>
                  <Text style={[styles.languageLabel, active && styles.languageLabelActive]}>
                    {lang.nativeLabel}
                  </Text>
                  <Text style={styles.languageSubLabel}>{lang.label}</Text>
                </View>
                {active ? (
                  <Icon source="check-circle" size={20} color={colors.primary} />
                ) : (
                  <View style={styles.radioEmpty} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Divider style={styles.divider} />

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('settings.notifications')}</Text>
        <Text style={styles.sectionHint}>{t('settings.notificationsHint')}</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>{t('settings.notificationsEnabled')}</Text>
          <Switch value={notifications.enabled} onValueChange={handleNotificationsToggle} />
        </View>

        <View style={[styles.toggleRow, !notifications.enabled && styles.toggleRowDisabled]}>
          <View style={styles.toggleTextGroup}>
            <Text style={styles.toggleLabel}>{t('settings.propertyAlerts')}</Text>
            <Text style={styles.toggleSubLabel}>{t('settings.propertyAlertsHint')}</Text>
          </View>
          <Switch
            value={notifications.propertyAlerts}
            disabled={!notifications.enabled}
            onValueChange={() => { dispatch(toggleNotificationCategory('propertyAlerts')); }}
          />
        </View>

        <View style={[styles.toggleRow, !notifications.enabled && styles.toggleRowDisabled]}>
          <View style={styles.toggleTextGroup}>
            <Text style={styles.toggleLabel}>{t('settings.paymentUpdates')}</Text>
            <Text style={styles.toggleSubLabel}>{t('settings.paymentUpdatesHint')}</Text>
          </View>
          <Switch
            value={notifications.paymentUpdates}
            disabled={!notifications.enabled}
            onValueChange={() => { dispatch(toggleNotificationCategory('paymentUpdates')); }}
          />
        </View>

        <View style={[styles.toggleRow, !notifications.enabled && styles.toggleRowDisabled]}>
          <View style={styles.toggleTextGroup}>
            <Text style={styles.toggleLabel}>{t('settings.chatMessages')}</Text>
            <Text style={styles.toggleSubLabel}>{t('settings.chatMessagesHint')}</Text>
          </View>
          <Switch
            value={notifications.chatMessages}
            disabled={!notifications.enabled}
            onValueChange={() => { dispatch(toggleNotificationCategory('chatMessages')); }}
          />
        </View>

        <TouchableOpacity
          style={[styles.testButton, !notifications.enabled && styles.testButtonDisabled]}
          activeOpacity={0.85}
          disabled={!notifications.enabled || sendingTest}
          onPress={handleSendTest}
          testID="send-test-notification"
        >
          <Icon source="bell-ring-outline" size={18} color={colors.primary} />
          <Text style={styles.testButtonLabel}>
            {sendingTest ? '...' : t('settings.testNotificationSent')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 20,
      paddingBottom: 40,
    },
    title: {
      fontFamily: fonts.displaySemiBold,
      fontSize: moderateScale(type.h1),
      color: colors.text,
      marginBottom: 20,
    },
    section: {
      marginBottom: 8,
    },
    sectionTitle: {
      fontFamily: fonts.bodySemiBold,
      fontSize: moderateScale(type.h3),
      color: colors.text,
      marginBottom: 4,
    },
    sectionHint: {
      fontFamily: fonts.body,
      fontSize: moderateScale(type.caption),
      color: colors.textMuted,
      marginBottom: 14,
    },
    divider: {
      marginVertical: 20,
      backgroundColor: colors.border,
    },
    optionRow: {
      flexDirection: 'row',
      gap: 10,
    },
    optionCard: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    optionCardActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    optionLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: moderateScale(type.caption),
      color: colors.text,
    },
    optionLabelActive: {
      color: colors.textInverse,
    },
    languageList: {
      gap: 8,
    },
    languageRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    languageRowActive: {
      borderColor: colors.primary,
    },
    languageLabel: {
      fontFamily: fonts.bodySemiBold,
      fontSize: moderateScale(type.body),
      color: colors.text,
    },
    languageLabelActive: {
      color: colors.primary,
    },
    languageSubLabel: {
      fontFamily: fonts.body,
      fontSize: moderateScale(type.caption),
      color: colors.textMuted,
      marginTop: 2,
    },
    radioEmpty: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 10,
    },
    toggleRowDisabled: {
      opacity: 0.5,
    },
    toggleTextGroup: {
      flex: 1,
      paddingRight: 12,
    },
    toggleLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: moderateScale(type.body),
      color: colors.text,
    },
    toggleSubLabel: {
      fontFamily: fonts.body,
      fontSize: moderateScale(type.caption),
      color: colors.textMuted,
      marginTop: 2,
    },
    testButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginTop: 14,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    testButtonDisabled: {
      opacity: 0.5,
    },
    testButtonLabel: {
      fontFamily: fonts.bodyMedium,
      fontSize: moderateScale(type.body),
      color: colors.primary,
    },
  });

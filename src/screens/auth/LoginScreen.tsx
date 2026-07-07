// src/screens/auth/LoginScreen.tsx

import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '@/navigation/AuthNavigator';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import Loader from '@/components/Loader/Loader';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { moderateScale, maxContentWidth } from '@/utils/responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { loginUser, clearAuthError } from '@/redux/auth/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

interface FormErrors {
  email?: string;
  password?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { width } = useWindowDimensions();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const contentWidth = Math.min(width, maxContentWidth());

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Enter a valid email address';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = () => {
    dispatch(clearAuthError());
    if (!validate()) return;
    dispatch(loginUser({ email: email.trim(), password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, { width: contentWidth }]}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to continue browsing properties</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="email-outline"
              error={formErrors.email}
              testID="login-email-input"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-outline"
              error={formErrors.password}
              testID="login-password-input"
            />

            {error ? <Text style={styles.serverError}>{error}</Text> : null}

            <Button
              label="Log In"
              onPress={handleLogin}
              loading={isLoading}
              testID="login-submit-button"
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Text
                style={styles.link}
                onPress={() => navigation.navigate('Register')}
              >
                Register
              </Text>
            </View>

            <Text style={styles.hint}>
              Demo login: demo@estategoNumbergo.com / password123
            </Text>
          </View>
        </View>
      </ScrollView>
      <Loader visible={isLoading} label="Signing you in..." />
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  card: {
    alignSelf: 'center',
  },
  title: {
    fontSize: moderateScale(26),
    fontFamily: fonts.displayBold,
    color: colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: moderateScale(14),
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 28,
  },
  form: {
    gap: 16,
  },
  serverError: {
    color: colors.error,
    fontFamily: fonts.body,
    fontSize: moderateScale(13),
    textAlign: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: moderateScale(13),
  },
  link: {
    color: colors.primary,
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(13),
  },
  hint: {
    color: colors.textMuted,
    fontFamily: fonts.body,
    fontSize: moderateScale(11),
    textAlign: 'center',
    marginTop: 20,
  },
});

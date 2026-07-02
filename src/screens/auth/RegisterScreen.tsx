// src/screens/auth/RegisterScreen.tsx

import React, { useState } from 'react';
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
import { colors } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import { moderateScale, maxContentWidth } from '@/utils/responsive';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { registerUser, clearAuthError } from '@/redux/auth/authSlice';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterScreen({ navigation }: Props) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const { width } = useWindowDimensions();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const contentWidth = Math.min(width, maxContentWidth());

  const validate = (): boolean => {
    const errors: FormErrors = {};
    if (!name.trim()) errors.name = 'Full name is required';

    if (!email.trim()) errors.email = 'Email is required';
    else if (!validateEmail(email)) errors.email = 'Enter a valid email address';

    if (!password) errors.password = 'Password is required';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters';

    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (confirmPassword !== password) errors.confirmPassword = 'Passwords do not match';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = () => {
    dispatch(clearAuthError());
    if (!validate()) return;
    dispatch(registerUser({ name: name.trim(), email: email.trim(), password }));
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
          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Join EstateGo to start exploring properties</Text>

          <View style={styles.form}>
            <Input
              label="Full Name"
              value={name}
              onChangeText={setName}
              icon="account-outline"
              autoCapitalize="words"
              error={formErrors.name}
              testID="register-name-input"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon="email-outline"
              error={formErrors.email}
              testID="register-email-input"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon="lock-outline"
              error={formErrors.password}
              testID="register-password-input"
            />
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              icon="lock-check-outline"
              error={formErrors.confirmPassword}
              testID="register-confirm-password-input"
            />

            {error ? <Text style={styles.serverError}>{error}</Text> : null}

            <Button
              label="Register"
              onPress={handleRegister}
              loading={isLoading}
              testID="register-submit-button"
            />

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
                Log In
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
      <Loader visible={isLoading} label="Creating your account..." />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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
});

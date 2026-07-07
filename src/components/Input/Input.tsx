// src/components/Input/Input.tsx

import React, { useState, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput, HelperText } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { moderateScale } from '@/utils/responsive';

interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'decimal-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words';
  icon?: string;
  multiline?: boolean;
  numberOfLines?: number;
  testID?: string;
}

export default function Input({
  label,
  value,
  onChangeText,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  icon,
  multiline = false,
  numberOfLines,
  testID,
}: AppInputProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hideText, setHideText] = useState(secureTextEntry);

  return (
    <View style={styles.wrapper}>
      <TextInput
        mode="outlined"
        label={label}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={hideText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        error={!!error}
        multiline={multiline}
        numberOfLines={numberOfLines}
        outlineColor={colors.border}
        activeOutlineColor={colors.primary}
        style={[styles.input, multiline && styles.multilineInput]}
        left={icon ? <TextInput.Icon icon={icon} /> : undefined}
        right={
          secureTextEntry ? (
            <TextInput.Icon
              icon={hideText ? 'eye-off' : 'eye'}
              onPress={() => setHideText((prev) => !prev)}
            />
          ) : undefined
        }
        testID={testID}
      />
      <HelperText type="error" visible={!!error} style={styles.helper}>
        {error}
      </HelperText>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  input: {
    backgroundColor: colors.surface,
    fontSize: moderateScale(15),
  },
  multilineInput: {
    minHeight: moderateScale(90),
  },
  helper: {
    marginTop: -4,
  },
});

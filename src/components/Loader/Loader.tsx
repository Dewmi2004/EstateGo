// src/components/Loader/Loader.tsx

import React, { useMemo } from 'react';
import { View, StyleSheet, Modal } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';

interface LoaderProps {
  visible: boolean;
  label?: string;
}

export default function Loader({ visible, label = 'Please wait...' }: LoaderProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <ActivityIndicator animating size="large" color={colors.primary} />
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    gap: 12,
  },
  label: {
    color: colors.text,
    marginTop: 8,
  },
});

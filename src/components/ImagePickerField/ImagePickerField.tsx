// src/components/ImagePickerField/ImagePickerField.tsx
// Lets the user either take a new photo or pick one from their device's
// gallery for a property listing. Camera capture on web isn't supported by
// expo-image-picker (it falls back to the browser's file picker), which is
// noted inline below rather than hidden.

import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Text, Icon } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useThemeColors } from '@/theme/useThemeColors';
import { AppColors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';

interface ImagePickerFieldProps {
  label?: string;
  value: string;
  onChange: (uri: string) => void;
}

const IMAGE_OPTIONS: ImagePicker.ImagePickerOptions = {
  mediaTypes: ImagePicker.MediaTypeOptions.Images,
  quality: 0.7,
  aspect: [4, 3],
  allowsEditing: true,
};

export default function ImagePickerField({ label = 'Property Photo', value, onChange }: ImagePickerFieldProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo library access to choose an image.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync(IMAGE_OPTIONS);
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera not available', 'Camera capture isn\'t supported in the web preview — choose from gallery instead.');
      return;
    }
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow camera access to take a photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync(IMAGE_OPTIONS);
    if (!result.canceled && result.assets?.[0]?.uri) {
      onChange(result.assets[0].uri);
    }
  };

  const handlePress = () => {
    Alert.alert('Add Property Photo', 'Choose how you want to add a photo', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.box} activeOpacity={0.85} onPress={handlePress}>
        {value ? (
          <Image source={{ uri: value }} style={styles.preview} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Icon source="camera-plus-outline" size={28} color={colors.textMuted} />
            <Text style={styles.placeholderText}>Tap to add a photo</Text>
          </View>
        )}
        {value ? (
          <View style={styles.changeBadge}>
            <Icon source="pencil" size={14} color={colors.textInverse} />
            <Text style={styles.changeText}>Change</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
  wrapper: {
    marginBottom: 4,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    marginBottom: 8,
  },
  box: {
    width: '100%',
    height: moderateScale(160),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  preview: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  placeholderText: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
  },
  changeBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 31, 58, 0.7)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  changeText: {
    color: colors.textInverse,
    fontFamily: fonts.bodySemiBold,
    fontSize: moderateScale(type.micro),
  },
});

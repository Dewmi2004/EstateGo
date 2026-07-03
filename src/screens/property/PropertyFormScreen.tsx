// src/screens/property/PropertyFormScreen.tsx
// Create + Update from the CRUD set. One screen, two modes — driven by which
// route it was pushed as (AddProperty vs EditProperty), matching the spec's
// "Add Property" / "Edit Property" screens (Section 11).

import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PropertyStackParamList } from '@/navigation/PropertyNavigator';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { createProperty, updateProperty, fetchPropertyById, clearSelected } from '@/redux/property/propertySlice';
import Input from '@/components/Input/Input';
import Button from '@/components/Button/Button';
import ChipSelector from '@/components/ChipSelector/ChipSelector';
import Loader from '@/components/Loader/Loader';
import { colors } from '@/theme/colors';
import { fonts, type } from '@/theme/typography';
import { moderateScale } from '@/utils/responsive';
import { PropertyFormInput, PropertyType, PropertyStatus } from '@/types/property.types';

type AddProps = NativeStackScreenProps<PropertyStackParamList, 'AddProperty'>;
type EditProps = NativeStackScreenProps<PropertyStackParamList, 'EditProperty'>;

const TYPE_OPTIONS: { label: string; value: PropertyType }[] = [
  { label: 'House', value: 'House' },
  { label: 'Flat', value: 'Flat' },
  { label: 'Room', value: 'Room' },
  { label: 'Office', value: 'Office' },
  { label: 'Shop', value: 'Shop' },
  { label: 'Land', value: 'Land' },
];

const STATUS_OPTIONS: { label: string; value: PropertyStatus }[] = [
  { label: 'Available', value: 'Available' },
  { label: 'Rented', value: 'Rented' },
  { label: 'Sold', value: 'Sold' },
];

const emptyForm: PropertyFormInput = {
  title: '',
  description: '',
  price: 0,
  location: '',
  city: '',
  bedrooms: 1,
  bathrooms: 1,
  area: 0,
  propertyType: 'House',
  ownerName: '',
  contactNumber: '',
  image: '',
  status: 'Available',
};

interface FormErrors {
  title?: string;
  price?: string;
  city?: string;
  location?: string;
  ownerName?: string;
  contactNumber?: string;
}

export default function PropertyFormScreen({ route, navigation }: AddProps | EditProps) {
  const isEdit = route.name === 'EditProperty';
  const propertyId = isEdit ? (route.params as { propertyId: string }).propertyId : undefined;

  const dispatch = useAppDispatch();
  const { selected, isSubmitting } = useAppSelector((state) => state.property);
  const { user } = useAppSelector((state) => state.auth);

  const [form, setForm] = useState<PropertyFormInput>(emptyForm);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (isEdit && propertyId) {
      dispatch(fetchPropertyById(propertyId));
    } else {
      // Pre-fill owner details from the logged-in user for a new listing.
      setForm((prev) => ({ ...prev, ownerName: user?.name ?? '' }));
    }
    return () => {
      dispatch(clearSelected());
    };
  }, [isEdit, propertyId, dispatch, user]);

  useEffect(() => {
    if (isEdit && selected && selected.id === propertyId) {
      const { id, ownerId, verified, createdAt, updatedAt, ...rest } = selected;
      setForm(rest);
    }
  }, [isEdit, selected, propertyId]);

  const update = <K extends keyof PropertyFormInput>(key: K, value: PropertyFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.price || form.price <= 0) next.price = 'Enter a valid price';
    if (!form.city.trim()) next.city = 'City is required';
    if (!form.location.trim()) next.location = 'Location is required';
    if (!form.ownerName.trim()) next.ownerName = 'Owner name is required';
    if (!form.contactNumber.trim()) next.contactNumber = 'Contact number is required';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const payload: PropertyFormInput = {
      ...form,
      image: form.image.trim() || 'https://picsum.photos/800/600',
    };

    if (isEdit && propertyId) {
      const result = await dispatch(updateProperty({ id: propertyId, input: payload }));
      if (updateProperty.fulfilled.match(result)) {
        navigation.goBack();
      }
    } else {
      const result = await dispatch(createProperty(payload));
      if (createProperty.fulfilled.match(result)) {
        navigation.goBack();
      }
    }
  };

  const heading = useMemo(() => (isEdit ? 'Edit Property' : 'Post Your Property'), [isEdit]);

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>{heading}</Text>
        <Text style={styles.subheading}>
          {isEdit ? 'Update the details below.' : "Your listing will be visible to everyone once you post it."}
        </Text>

        <Text style={styles.sectionLabel}>Basic Info</Text>
        <Input label="Title" value={form.title} onChangeText={(v) => update('title', v)} error={errors.title} />
        <Input
          label="Description"
          value={form.description}
          onChangeText={(v) => update('description', v)}
          multiline
          numberOfLines={4}
        />
        <ChipSelector label="Property Type" options={TYPE_OPTIONS} value={form.propertyType} onChange={(v) => update('propertyType', v)} />
        <ChipSelector label="Status" options={STATUS_OPTIONS} value={form.status} onChange={(v) => update('status', v)} />

        <Text style={styles.sectionLabel}>Location</Text>
        <Input label="Location / Area" value={form.location} onChangeText={(v) => update('location', v)} error={errors.location} />
        <Input label="City" value={form.city} onChangeText={(v) => update('city', v)} error={errors.city} />

        <Text style={styles.sectionLabel}>Details</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Input
              label="Price (৳/mo)"
              value={form.price ? String(form.price) : ''}
              onChangeText={(v) => update('price', Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
              error={errors.price}
            />
          </View>
          <View style={styles.rowItem}>
            <Input
              label="Area (sqft)"
              value={form.area ? String(form.area) : ''}
              onChangeText={(v) => update('area', Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Input
              label="Bedrooms"
              value={String(form.bedrooms)}
              onChangeText={(v) => update('bedrooms', Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.rowItem}>
            <Input
              label="Bathrooms"
              value={String(form.bathrooms)}
              onChangeText={(v) => update('bathrooms', Number(v.replace(/[^0-9]/g, '')) || 0)}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Input
          label="Image URL (optional)"
          value={form.image}
          onChangeText={(v) => update('image', v)}
          autoCapitalize="none"
        />

        <Text style={styles.sectionLabel}>Contact</Text>
        <Input label="Owner Name" value={form.ownerName} onChangeText={(v) => update('ownerName', v)} error={errors.ownerName} />
        <Input
          label="Contact Number"
          value={form.contactNumber}
          onChangeText={(v) => update('contactNumber', v)}
          keyboardType="phone-pad"
          error={errors.contactNumber}
        />

        <Button
          label={isEdit ? 'Save Changes' : 'Post Property'}
          onPress={handleSubmit}
          loading={isSubmitting}
          style={styles.submitButton}
        />
        <Button label="Cancel" mode="text" onPress={() => navigation.goBack()} />
      </ScrollView>
      <Loader visible={isSubmitting} label={isEdit ? 'Saving changes...' : 'Posting property...'} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: moderateScale(20),
    gap: 14,
    paddingBottom: 60,
  },
  heading: {
    fontFamily: fonts.displayBold,
    fontSize: moderateScale(type.h1),
    color: colors.text,
  },
  subheading: {
    fontFamily: fonts.body,
    fontSize: moderateScale(type.caption),
    color: colors.textMuted,
    marginBottom: 6,
  },
  sectionLabel: {
    fontFamily: fonts.displaySemiBold,
    fontSize: moderateScale(type.h3),
    color: colors.text,
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  submitButton: {
    marginTop: 12,
  },
});

// src/navigation/PropertyNavigator.tsx
// Stack nested inside the "Properties" tab: browsing list -> details ->
// add/edit form. Kept separate from MainNavigator's tab bar so Details/Edit
// don't show up as their own tabs.

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PropertyListScreen from '@/screens/property/PropertyListScreen';
import PropertyDetailsScreen from '@/screens/property/PropertyDetailsScreen';
import PropertyFormScreen from '@/screens/property/PropertyFormScreen';
import PaymentScreen from '@/screens/payment/PaymentScreen';
import { PropertyFormInput } from '@/types/property.types';

export type PropertyStackParamList = {
  PropertyList: undefined;
  PropertyDetails: { propertyId: string };
  AddProperty: undefined;
  EditProperty: { propertyId: string };
  Payment: { formInput: PropertyFormInput };
};

const Stack = createNativeStackNavigator<PropertyStackParamList>();

export default function PropertyNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PropertyList" component={PropertyListScreen} />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="AddProperty" component={PropertyFormScreen} />
      <Stack.Screen name="EditProperty" component={PropertyFormScreen} />
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
}

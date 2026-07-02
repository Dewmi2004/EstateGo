// src/types/property.types.ts
// Matches the central data model from the project spec (Section 9).

export type PropertyType = 'House' | 'Flat' | 'Room' | 'Office' | 'Shop' | 'Land';
export type PropertyStatus = 'Available' | 'Rented' | 'Sold';

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number; // sqft
  propertyType: PropertyType;
  ownerName: string;
  contactNumber: string;
  image: string;
  status: PropertyStatus;
  verified: boolean;
  isFavorite?: boolean;
}

export interface Category {
  id: string;
  label: string;
  icon: string; // MaterialCommunityIcons name
  propertyType: PropertyType;
  count: number;
}

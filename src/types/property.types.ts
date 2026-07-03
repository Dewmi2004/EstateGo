// src/types/property.types.ts
// Matches the central data model from the project spec (Section 9), extended
// with an ownerId so CRUD can be scoped to "my properties" and favorites can
// be tied to a user.

export type PropertyType = 'House' | 'Flat' | 'Room' | 'Office' | 'Shop' | 'Land';
export type PropertyStatus = 'Available' | 'Rented' | 'Sold';

export interface Property {
  id: string;
  ownerId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface PropertyFormInput {
  title: string;
  description: string;
  price: number;
  location: string;
  city: string;
  bedrooms: number;
  bathrooms: number;
  area: number;
  propertyType: PropertyType;
  ownerName: string;
  contactNumber: string;
  image: string;
  status: PropertyStatus;
}

export interface PropertyFilters {
  search?: string;
  city?: string;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  mine?: boolean; // only the logged-in user's own listings
}

export interface Category {
  id: string;
  label: string;
  icon: string; // MaterialCommunityIcons name
  propertyType: PropertyType;
  count: number;
}


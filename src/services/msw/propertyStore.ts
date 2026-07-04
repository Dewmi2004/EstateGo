// src/services/msw/propertyStore.ts
// In-memory Property CRUD logic, shared by both mock transports:
// - handlers.ts (msw/native, used on Android/iOS)
// - webMockAdapter.ts (used on web)
// Keeping the actual list/create/update/delete logic here means both
// transports behave identically and there's only one place to fix bugs.

import { Property, PropertyFilters, PropertyFormInput } from '@/types/property.types';
import { featuredProperties } from '@/data/mockProperties';
import { paymentStore } from './paymentStore';

let properties: Property[] = [...featuredProperties];
let nextId = properties.length + 1;

export class PropertyError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function matchesFilters(property: Property, filters: PropertyFilters, userId: string | null): boolean {
  if (filters.mine) {
    if (!userId || property.ownerId !== userId) return false;
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    const haystack = `${property.title} ${property.location} ${property.city}`.toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  if (filters.city && property.city.toLowerCase() !== filters.city.toLowerCase()) return false;
  if (filters.propertyType && property.propertyType !== filters.propertyType) return false;
  if (filters.minPrice !== undefined && property.price < filters.minPrice) return false;
  if (filters.maxPrice !== undefined && property.price > filters.maxPrice) return false;
  if (filters.bedrooms !== undefined && property.bedrooms < filters.bedrooms) return false;
  return true;
}

export const propertyStore = {
  list(filters: PropertyFilters = {}, userId: string | null = null): Property[] {
    return properties
      .filter((p) => matchesFilters(p, filters, userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  getById(id: string): Property {
    const property = properties.find((p) => p.id === id);
    if (!property) throw new PropertyError('Property not found', 404);
    return property;
  },

  create(input: PropertyFormInput, ownerId: string | null, paymentOrderId: string | null): Property {
    if (!ownerId) throw new PropertyError('You must be logged in to list a property', 401);
    if (!input.title || !input.price || !input.city) {
      throw new PropertyError('Title, price and city are required', 400);
    }
    if (!paymentOrderId || !paymentStore.isPaid(paymentOrderId, ownerId)) {
      throw new PropertyError('A confirmed payment is required before posting a listing', 402);
    }

    const now = new Date().toISOString();
    const property: Property = {
      id: `p${nextId++}`,
      ownerId,
      verified: false,
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    properties = [property, ...properties];
    return property;
  },

  update(id: string, input: Partial<PropertyFormInput>, userId: string | null): Property {
    const index = properties.findIndex((p) => p.id === id);
    if (index === -1) throw new PropertyError('Property not found', 404);

    const existing = properties[index];
    if (!userId || existing.ownerId !== userId) {
      throw new PropertyError('You can only edit your own listings', 403);
    }

    const updated: Property = { ...existing, ...input, updatedAt: new Date().toISOString() };
    properties[index] = updated;
    return updated;
  },

  remove(id: string, userId: string | null): void {
    const index = properties.findIndex((p) => p.id === id);
    if (index === -1) throw new PropertyError('Property not found', 404);

    const existing = properties[index];
    if (!userId || existing.ownerId !== userId) {
      throw new PropertyError('You can only delete your own listings', 403);
    }

    properties.splice(index, 1);
  },

  // Test/dev helper — not used by the API surface.
  _reset(): void {
    properties = [...featuredProperties];
    nextId = properties.length + 1;
  },
};

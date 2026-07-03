// src/services/api/propertyApi.ts

import { axiosInstance } from './axiosInstance';
import { Property, PropertyFilters, PropertyFormInput } from '@/types/property.types';

export const propertyApi = {
  list: async (filters: PropertyFilters = {}): Promise<Property[]> => {
    const { data } = await axiosInstance.get<Property[]>('/properties', { params: filters });
    return data;
  },

  getById: async (id: string): Promise<Property> => {
    const { data } = await axiosInstance.get<Property>(`/properties/${id}`);
    return data;
  },

  create: async (input: PropertyFormInput): Promise<Property> => {
    const { data } = await axiosInstance.post<Property>('/properties', input);
    return data;
  },

  update: async (id: string, input: Partial<PropertyFormInput>): Promise<Property> => {
    const { data } = await axiosInstance.put<Property>(`/properties/${id}`, input);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/properties/${id}`);
  },
};

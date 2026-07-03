// src/services/api/favoriteApi.ts

import { axiosInstance } from './axiosInstance';

export const favoriteApi = {
  list: async (): Promise<string[]> => {
    const { data } = await axiosInstance.get<string[]>('/favorites');
    return data;
  },

  add: async (propertyId: string): Promise<void> => {
    await axiosInstance.post('/favorites', { propertyId });
  },

  remove: async (propertyId: string): Promise<void> => {
    await axiosInstance.delete(`/favorites/${propertyId}`);
  },
};

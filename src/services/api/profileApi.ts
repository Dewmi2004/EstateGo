// src/services/api/profileApi.ts

import { axiosInstance } from './axiosInstance';
import { User } from '@/types/auth.types';

export const profileApi = {
  get: async (): Promise<User> => {
    const { data } = await axiosInstance.get<User>('/profile');
    return data;
  },

  update: async (patch: { name?: string; email?: string }): Promise<User> => {
    const { data } = await axiosInstance.put<User>('/profile', patch);
    return data;
  },
};

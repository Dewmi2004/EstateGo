// src/services/api/authApi.ts

import { axiosInstance } from './axiosInstance';
import { AuthResponse, LoginPayload, RegisterPayload } from '@/types/auth.types';

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>('/login', payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await axiosInstance.post<AuthResponse>('/register', payload);
    return data;
  },

  logout: async (): Promise<void> => {
    await axiosInstance.post('/logout');
  },
};

// src/services/api/axiosInstance.ts

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL is irrelevant while MSW intercepts requests, but is kept realistic
// so switching to a real backend later is a one-line change.
const BASE_URL = 'https://api.estategoNumbergo.mock';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: '@estategoNumbergo/accessToken',
  EXPIRES_AT: '@estategoNumbergo/expiresAt',
  USER: '@estategoNumbergo/user',
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the stored token to every outgoing request automatically.
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize error messages so screens can show a single friendly string.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

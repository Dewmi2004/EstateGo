// src/redux/auth/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/api/authApi';
import { STORAGE_KEYS } from '@/services/api/axiosInstance';
import { isTokenExpired } from '@/services/msw/mockJwt';
import {
  AuthState,
  LoginPayload,
  RegisterPayload,
  AuthResponse,
  User,
} from '@/types/auth.types';

const initialState: AuthState = {
  user: null,
  tokens: null,
  isAuthenticated: false,
  isLoading: false,
  isBootstrapping: true,
  error: null,
};

async function persistAuth(response: AuthResponse): Promise<void> {
  await AsyncStorage.multiSet([
    [STORAGE_KEYS.ACCESS_TOKEN, response.accessToken],
    [STORAGE_KEYS.EXPIRES_AT, String(response.expiresAt)],
    [STORAGE_KEYS.USER, JSON.stringify(response.user)],
  ]);
}

async function clearPersistedAuth(): Promise<void> {
  await AsyncStorage.multiRemove([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.EXPIRES_AT,
    STORAGE_KEYS.USER,
  ]);
}

// Runs once on app launch (from SplashScreen) to restore a valid session.
export const bootstrapAuth = createAsyncThunk<
  { user: User; accessToken: string; expiresAt: number } | null
>('auth/bootstrap', async () => {
  const [[, token], [, expiresAtStr], [, userStr]] = await AsyncStorage.multiGet([
    STORAGE_KEYS.ACCESS_TOKEN,
    STORAGE_KEYS.EXPIRES_AT,
    STORAGE_KEYS.USER,
  ]);

  if (!token || !expiresAtStr || !userStr) {
    return null;
  }

  const expiresAt = Number(expiresAtStr);
  if (isTokenExpired(expiresAt)) {
    await clearPersistedAuth();
    return null;
  }

  return { user: JSON.parse(userStr) as User, accessToken: token, expiresAt };
});

export const loginUser = createAsyncThunk<AuthResponse, LoginPayload, { rejectValue: string }>(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.login(payload);
      await persistAuth(response);
      return response;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterPayload, { rejectValue: string }>(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await authApi.register(payload);
      await persistAuth(response);
      return response;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout();
  } finally {
    await clearPersistedAuth();
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // bootstrap
      .addCase(bootstrapAuth.pending, (state) => {
        state.isBootstrapping = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isBootstrapping = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.tokens = { accessToken: action.payload.accessToken, expiresAt: action.payload.expiresAt };
          state.isAuthenticated = true;
        }
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isBootstrapping = false;
      })

      // login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = { accessToken: action.payload.accessToken, expiresAt: action.payload.expiresAt };
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Login failed';
      })

      // register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.tokens = { accessToken: action.payload.accessToken, expiresAt: action.payload.expiresAt };
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Registration failed';
      })

      // logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.tokens = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;

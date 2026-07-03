// src/redux/favorite/favoriteSlice.ts
// Stores only favorited property IDs (not full Property objects) — the
// property data itself lives in propertySlice, this just tracks membership.

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { favoriteApi } from '@/services/api/favoriteApi';
import { logoutUser } from '@/redux/auth/authSlice';

interface FavoriteState {
  ids: string[];
  isLoading: boolean;
  error: string | null;
}

const initialState: FavoriteState = {
  ids: [],
  isLoading: false,
  error: null,
};

export const fetchFavorites = createAsyncThunk<string[], void, { rejectValue: string }>(
  'favorite/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await favoriteApi.list();
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const toggleFavorite = createAsyncThunk<
  { propertyId: string; isFavorite: boolean },
  string,
  { rejectValue: string; state: { favorite: FavoriteState } }
>('favorite/toggle', async (propertyId, { getState, rejectWithValue }) => {
  try {
    const alreadyFavorite = getState().favorite.ids.includes(propertyId);
    if (alreadyFavorite) {
      await favoriteApi.remove(propertyId);
      return { propertyId, isFavorite: false };
    }
    await favoriteApi.add(propertyId);
    return { propertyId, isFavorite: true };
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

const favoriteSlice = createSlice({
  name: 'favorite',
  initialState,
  reducers: {
    clearFavorites: (state) => {
      state.ids = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action: PayloadAction<string[]>) => {
        state.isLoading = false;
        state.ids = action.payload;
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load favorites';
      })
      .addCase(toggleFavorite.fulfilled, (state, action) => {
        const { propertyId, isFavorite } = action.payload;
        state.ids = isFavorite ? [...state.ids, propertyId] : state.ids.filter((id) => id !== propertyId);
      })
      .addCase(toggleFavorite.rejected, (state, action) => {
        state.error = action.payload ?? 'Failed to update favorite';
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.ids = [];
      });
  },
});

export const { clearFavorites } = favoriteSlice.actions;
export default favoriteSlice.reducer;

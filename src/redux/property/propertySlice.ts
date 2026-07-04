// src/redux/property/propertySlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { propertyApi } from '@/services/api/propertyApi';
import { Property, PropertyFilters, PropertyFormInput } from '@/types/property.types';

interface PropertyState {
  items: Property[];
  selected: Property | null;
  filters: PropertyFilters;
  isLoading: boolean;
  isSubmitting: boolean;
  isDeleting: boolean;
  error: string | null;
}

const initialState: PropertyState = {
  items: [],
  selected: null,
  filters: {},
  isLoading: false,
  isSubmitting: false,
  isDeleting: false,
  error: null,
};

export const fetchProperties = createAsyncThunk<Property[], PropertyFilters | undefined, { rejectValue: string }>(
  'property/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      return await propertyApi.list(filters ?? {});
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const fetchPropertyById = createAsyncThunk<Property, string, { rejectValue: string }>(
  'property/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      return await propertyApi.getById(id);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const createProperty = createAsyncThunk<
  Property,
  { input: PropertyFormInput; paymentOrderId: string },
  { rejectValue: string }
>('property/create', async ({ input, paymentOrderId }, { rejectWithValue }) => {
  try {
    return await propertyApi.create(input, paymentOrderId);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const updateProperty = createAsyncThunk<
  Property,
  { id: string; input: Partial<PropertyFormInput> },
  { rejectValue: string }
>('property/update', async ({ id, input }, { rejectWithValue }) => {
  try {
    return await propertyApi.update(id, input);
  } catch (err) {
    return rejectWithValue((err as Error).message);
  }
});

export const deleteProperty = createAsyncThunk<string, string, { rejectValue: string }>(
  'property/delete',
  async (id, { rejectWithValue }) => {
    try {
      await propertyApi.remove(id);
      return id;
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const propertySlice = createSlice({
  name: 'property',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<PropertyFilters>) => {
      state.filters = action.payload;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
    clearPropertyError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch all
      .addCase(fetchProperties.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProperties.fulfilled, (state, action: PayloadAction<Property[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchProperties.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load properties';
      })

      // fetch by id
      .addCase(fetchPropertyById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPropertyById.fulfilled, (state, action: PayloadAction<Property>) => {
        state.isLoading = false;
        state.selected = action.payload;
      })
      .addCase(fetchPropertyById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload ?? 'Failed to load property';
      })

      // create
      .addCase(createProperty.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(createProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.isSubmitting = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? 'Failed to create property';
      })

      // update
      .addCase(updateProperty.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(updateProperty.fulfilled, (state, action: PayloadAction<Property>) => {
        state.isSubmitting = false;
        state.items = state.items.map((p) => (p.id === action.payload.id ? action.payload : p));
        if (state.selected?.id === action.payload.id) state.selected = action.payload;
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload ?? 'Failed to update property';
      })

      // delete
      .addCase(deleteProperty.pending, (state) => {
        state.isDeleting = true;
        state.error = null;
      })
      .addCase(deleteProperty.fulfilled, (state, action: PayloadAction<string>) => {
        state.isDeleting = false;
        state.items = state.items.filter((p) => p.id !== action.payload);
        if (state.selected?.id === action.payload) state.selected = null;
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.isDeleting = false;
        state.error = action.payload ?? 'Failed to delete property';
      });
  },
});

export const { setFilters, clearSelected, clearPropertyError } = propertySlice.actions;
export default propertySlice.reducer;

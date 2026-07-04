// src/redux/payment/paymentSlice.ts
// Drives the PayHere-style checkout flow: create an order, simulate the
// gateway, confirm it, then propertySlice.createProperty uses the resulting
// orderId. Kept separate from propertySlice since a payment concerns the
// user's account/wallet, not any single property.

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { paymentApi } from '@/services/api/paymentApi';
import { PaymentOrder } from '@/types/payment.types';

interface PaymentState {
  currentOrder: PaymentOrder | null;
  isCreatingOrder: boolean;
  isConfirming: boolean;
  error: string | null;
}

const initialState: PaymentState = {
  currentOrder: null,
  isCreatingOrder: false,
  isConfirming: false,
  error: null,
};

export const startCheckout = createAsyncThunk<PaymentOrder, void, { rejectValue: string }>(
  'payment/startCheckout',
  async (_, { rejectWithValue }) => {
    try {
      return await paymentApi.checkout();
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

export const confirmPayment = createAsyncThunk<PaymentOrder, string, { rejectValue: string }>(
  'payment/confirm',
  async (orderId, { rejectWithValue }) => {
    try {
      return await paymentApi.confirm(orderId);
    } catch (err) {
      return rejectWithValue((err as Error).message);
    }
  }
);

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPayment: (state) => {
      state.currentOrder = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startCheckout.pending, (state) => {
        state.isCreatingOrder = true;
        state.error = null;
      })
      .addCase(startCheckout.fulfilled, (state, action) => {
        state.isCreatingOrder = false;
        state.currentOrder = action.payload;
      })
      .addCase(startCheckout.rejected, (state, action) => {
        state.isCreatingOrder = false;
        state.error = action.payload ?? 'Could not start checkout';
      })
      .addCase(confirmPayment.pending, (state) => {
        state.isConfirming = true;
        state.error = null;
      })
      .addCase(confirmPayment.fulfilled, (state, action) => {
        state.isConfirming = false;
        state.currentOrder = action.payload;
      })
      .addCase(confirmPayment.rejected, (state, action) => {
        state.isConfirming = false;
        state.error = action.payload ?? 'Payment could not be confirmed';
      });
  },
});

export const { resetPayment } = paymentSlice.actions;
export default paymentSlice.reducer;

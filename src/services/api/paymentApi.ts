// src/services/api/paymentApi.ts

import { axiosInstance } from './axiosInstance';
import { PaymentOrder } from '@/types/payment.types';

export const paymentApi = {
  checkout: async (): Promise<PaymentOrder> => {
    const { data } = await axiosInstance.post<PaymentOrder>('/payments/checkout');
    return data;
  },

  confirm: async (orderId: string): Promise<PaymentOrder> => {
    const { data } = await axiosInstance.post<PaymentOrder>(`/payments/${orderId}/confirm`);
    return data;
  },

  getStatus: async (orderId: string): Promise<PaymentOrder> => {
    const { data } = await axiosInstance.get<PaymentOrder>(`/payments/${orderId}`);
    return data;
  },
};

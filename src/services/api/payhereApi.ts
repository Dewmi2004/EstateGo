// src/services/api/payhereApi.ts
// Talks to the REAL PayHere server (server/), not the app's mock backend.
// Plain fetch on purpose — axiosInstance is wired to the mock adapter/MSW
// and would intercept these calls instead of reaching your ngrok URL.

import { PAYHERE_BACKEND_URL } from '@/config/env';

export interface PayHereCustomer {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
}

interface CreateSessionResponse {
  orderId: string;
  checkoutUrl: string;
}

interface OrderStatusResponse {
  orderId: string;
  status: 'pending' | 'paid' | 'failed';
}

function ensureConfigured() {
  if (PAYHERE_BACKEND_URL.includes('your-ngrok-subdomain')) {
    throw new Error(
      'PayHere server URL is not configured. Set PAYHERE_BACKEND_URL in src/config/env.ts to your ngrok URL — see server/README.md.'
    );
  }
}

export const payhereApi = {
  createSession: async (
    orderId: string,
    amount: number,
    customer?: PayHereCustomer
  ): Promise<CreateSessionResponse> => {
    ensureConfigured();
    const response = await fetch(`${PAYHERE_BACKEND_URL}/api/payhere/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, amount, currency: 'LKR', customer }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      throw new Error(body.message || 'Could not start PayHere checkout');
    }
    return response.json();
  },

  getOrderStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    ensureConfigured();
    const response = await fetch(`${PAYHERE_BACKEND_URL}/api/payhere/order/${orderId}`);
    if (!response.ok) {
      throw new Error('Could not fetch payment status');
    }
    return response.json();
  },
};

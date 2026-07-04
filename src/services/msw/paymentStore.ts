// src/services/msw/paymentStore.ts
// In-memory PayHere order lifecycle, shared by handlers.ts (native) and
// webMockAdapter.ts (web) — same pattern as propertyStore/favoriteStore.

import { PaymentOrder, LISTING_FEE_LKR } from '@/types/payment.types';

let orders: PaymentOrder[] = [];
let nextOrderNumber = 1;

export class PaymentError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export const paymentStore = {
  createOrder(userId: string): PaymentOrder {
    const order: PaymentOrder = {
      orderId: `ESTGO-${Date.now()}-${nextOrderNumber++}`,
      userId,
      amount: LISTING_FEE_LKR,
      purpose: 'property_listing',
      status: 'pending',
      createdAt: new Date().toISOString(),
      paidAt: null,
    };
    orders.push(order);
    return order;
  },

  getOrder(orderId: string): PaymentOrder {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) throw new PaymentError('Payment order not found', 404);
    return order;
  },

  // Stands in for PayHere's server-to-server "notify" webhook, which
  // confirms a payment once the gateway has actually processed it.
  markPaid(orderId: string, userId: string): PaymentOrder {
    const order = orders.find((o) => o.orderId === orderId);
    if (!order) throw new PaymentError('Payment order not found', 404);
    if (order.userId !== userId) throw new PaymentError('This order does not belong to you', 403);
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    return order;
  },

  isPaid(orderId: string, userId: string): boolean {
    const order = orders.find((o) => o.orderId === orderId);
    return !!order && order.status === 'paid' && order.userId === userId;
  },

  _reset(): void {
    orders = [];
    nextOrderNumber = 1;
  },
};

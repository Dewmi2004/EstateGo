// src/types/payment.types.ts
// A real PayHere integration needs a backend: PayHere requires a request
// hash generated server-side from your merchant secret (merchant_id +
// order_id + amount + currency, MD5-hashed) — that secret can never live in
// a mobile app bundle, or anyone could forge payments. Since this project
// has no backend yet (MSW/webMockAdapter stand in for one), this models the
// full PayHere order lifecycle so the checkout flow, UI, and CRUD gating are
// all correct now — swapping the mock confirm step for a real PayHere
// notify-webhook call later is a backend task, not a front-end rewrite.

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled';

export interface PaymentOrder {
  orderId: string;
  userId: string;
  amount: number; // LKR
  purpose: 'property_listing';
  status: PaymentStatus;
  createdAt: string;
  paidAt: string | null;
}

export const LISTING_FEE_LKR = 10000;

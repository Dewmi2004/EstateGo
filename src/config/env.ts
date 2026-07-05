// src/config/env.ts
// One place to point the app at your PayHere server (see server/README.md).
// This is separate from axiosInstance's mock BASE_URL — PayHere needs a
// real, publicly reachable server (via ngrok), not the in-app mock layer.

// Set this to your ngrok HTTPS URL, no trailing slash, e.g.:
// 'https://a1b2-c3d4.ngrok-free.app'
// Update it every time you restart ngrok (free URLs change each time).
export const PAYHERE_BACKEND_URL = 'https://your-ngrok-subdomain.ngrok-free.app';

// True once PAYHERE_BACKEND_URL has been changed from the placeholder.
// PaymentScreen uses this to decide whether to attempt the real PayHere
// sandbox checkout, or fall back to a simulated in-app payment — so the app
// always works out of the box, and automatically "upgrades" to the real
// gateway the moment you configure it, with no code changes needed either way.
export const isPayHereConfigured = (): boolean =>
  !PAYHERE_BACKEND_URL.includes('your-ngrok-subdomain');

# EstateGo PayHere Server

A minimal Express backend whose only job is the part of PayHere integration
that **must** happen server-side: generating the request hash and verifying
the notify webhook, both of which need your merchant secret. Your merchant
secret must never be embedded in the mobile app — anyone could extract it
from the app bundle and forge payments.

Everything else (property CRUD, auth, favorites) stays exactly as it was in
the RN app's own mock layer. This server exists purely for PayHere.

## 1. Get PayHere sandbox credentials

1. Go to https://sandbox.payhere.lk and create a sandbox merchant account (free).
2. Log in → **Integrations** (left sidebar) → note your **Merchant ID**.
3. Same page → generate/copy your **Merchant Secret**.
4. Under **Domains/Apps**, add your ngrok domain once you have it (step 3 below) — PayHere sandbox requires the domain calling it to be allow-listed.

## 2. Configure and run the server

```bash
cd server
cp .env.example .env
```

Edit `.env`:
```
PAYHERE_MERCHANT_ID=your_sandbox_merchant_id
PAYHERE_MERCHANT_SECRET=your_sandbox_merchant_secret
PUBLIC_BASE_URL=          # leave blank for now, fill in after step 3
PORT=4000
```

```bash
npm install
npm start
```

You should see:
```
PayHere server running on http://localhost:4000
```

## 3. Expose it with ngrok

In a **second terminal**:
```bash
ngrok http 4000
```

ngrok will print something like:
```
Forwarding   https://a1b2-c3d4.ngrok-free.app -> http://localhost:4000
```

Copy that `https://...ngrok-free.app` URL.

**Important — free ngrok URLs change every time you restart ngrok.** Each
time that happens, repeat steps 3b and 4 below.

**3b.** Paste the ngrok URL into `.env` as `PUBLIC_BASE_URL` (no trailing slash), then restart the server (`Ctrl+C`, `npm start` again) so it picks up the new value.

**3c.** Add the ngrok domain (just the host, e.g. `a1b2-c3d4.ngrok-free.app`) to your PayHere sandbox account's allow-listed domains (Integrations → Domains/Apps).

## 4. Point the mobile app at your server

In the RN app, open `src/config/env.ts` and set:
```ts
export const PAYHERE_BACKEND_URL = 'https://a1b2-c3d4.ngrok-free.app';
```
(same ngrok URL, no trailing slash). Save, then reload the app.

## 5. Test it

1. In the app: Home → Post Your Property → fill the form → Continue to Payment.
2. The Payment screen loads PayHere's real sandbox checkout inside a WebView.
3. Use PayHere's sandbox test card: **Card Number `4916217501611292`, any future expiry, any CVV.**
4. Complete payment. PayHere calls your `/api/payhere/notify` webhook (through ngrok) to confirm it server-to-server. Watch your server terminal — you'll see `[PayHere notify] Order ... confirmed PAID.`
5. The app polls your server, sees the order is paid, and creates the listing.

## Why this can't just live in the app

PayHere's request hash is:
```
hash = MD5( merchant_id + order_id + amount + currency + MD5(merchant_secret).toUpperCase() ).toUpperCase()
```
Computing this requires `merchant_secret`. If that secret were bundled into
the mobile app, anyone could decompile the app, extract it, and generate
valid hashes to fake payments. Keeping hash generation — and, just as
importantly, *verifying* the notify webhook's signature — on a server you
control is the only secure way to do this.

## Endpoints

| Method | Path | Called by | Purpose |
|---|---|---|---|
| POST | `/api/payhere/order` | RN app | Create an order, get back a checkout URL |
| GET | `/api/payhere/checkout/:orderId` | RN app's WebView | Auto-submits PayHere's hosted checkout form |
| POST | `/api/payhere/notify` | PayHere (server-to-server) | Confirms payment — verified via signature |
| GET | `/api/payhere/order/:orderId` | RN app | Poll payment status after WebView redirect |

## Going to production later

- Swap the in-memory `orders` Map for a real database.
- Move `PUBLIC_BASE_URL` to your real deployed domain instead of ngrok.
- Switch `sandbox.payhere.lk` to `www.payhere.lk` in `index.js`, and switch to your **live** merchant credentials.

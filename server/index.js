// server/index.js
// Minimal backend whose ONLY job is the part that genuinely cannot live in
// the mobile app: generating PayHere's request hash and verifying its
// notify webhook, both of which need the merchant secret. Everything else
// (property CRUD, auth, favorites) stays in the RN app's own mock layer —
// this server only exists for PayHere.
//
// Run:
//   1. cp .env.example .env   and fill in your PayHere SANDBOX credentials
//   2. npm install
//   3. npm start                       (starts on PORT, default 4000)
//   4. in a second terminal: ngrok http 4000
//   5. copy the ngrok https URL into .env as PUBLIC_BASE_URL, restart this server
//   6. paste that same ngrok URL into src/config/env.ts in the RN app
//
// See README.md in this folder for full sandbox setup steps.

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // PayHere's notify webhook posts form-encoded data

const {
  PAYHERE_MERCHANT_ID,
  PAYHERE_MERCHANT_SECRET,
  PUBLIC_BASE_URL,
  PORT = 4000,
} = process.env;

if (!PAYHERE_MERCHANT_ID || !PAYHERE_MERCHANT_SECRET) {
  console.warn(
    '\n⚠️  PAYHERE_MERCHANT_ID / PAYHERE_MERCHANT_SECRET are not set.\n' +
      '   Copy .env.example to .env and fill in your PayHere sandbox credentials.\n'
  );
}
if (!PUBLIC_BASE_URL) {
  console.warn(
    '\n⚠️  PUBLIC_BASE_URL is not set — PayHere will not be able to reach your\n' +
      '   notify webhook. Run ngrok and set this to your ngrok https URL.\n'
  );
}

// In-memory order store for THIS server only. Deliberately separate from
// the RN app's own mock paymentStore.ts — this one tracks what PayHere
// actually confirmed; the app's one tracks what the app's UI is gated on.
// The RN app bridges the two by calling its own mock /payments/:id/confirm
// once it sees this server report "paid" (see PaymentScreen.tsx).
const orders = new Map();

function md5(input) {
  return crypto.createHash('md5').update(input).digest('hex');
}

function generateHash(orderId, amountFormatted, currency) {
  const secretHash = md5(PAYHERE_MERCHANT_SECRET).toUpperCase();
  return md5(`${PAYHERE_MERCHANT_ID}${orderId}${amountFormatted}${currency}${secretHash}`).toUpperCase();
}

function formatAmount(amount) {
  return Number(amount).toFixed(2); // PayHere requires exactly 2 decimal places, e.g. "10000.00"
}

// ---------------------------------------------------------------------
// POST /api/payhere/order
// Creates (or looks up) an order for a given orderId + amount, ready to be
// checked out. The RN app already generates its own orderId via its mock
// paymentStore — we reuse that same id here so both systems agree on one
// canonical id per listing-fee payment.
// ---------------------------------------------------------------------
app.post('/api/payhere/order', (req, res) => {
  const { orderId, amount = 10000, currency = 'LKR', customer = {} } = req.body;
  if (!orderId) return res.status(400).json({ message: 'orderId is required' });

  const order = {
    orderId,
    amount: Number(amount),
    currency,
    status: 'pending',
    customer: {
      firstName: customer.firstName || 'EstateGo',
      lastName: customer.lastName || 'User',
      email: customer.email || 'buyer@estategoNumbergo.com',
      phone: customer.phone || '0771234567',
      address: customer.address || 'No. 1, Main Street',
      city: customer.city || 'Colombo',
      country: 'Sri Lanka',
    },
    createdAt: new Date().toISOString(),
  };
  orders.set(orderId, order);

  res.status(201).json({
    orderId,
    checkoutUrl: `${PUBLIC_BASE_URL}/api/payhere/checkout/${orderId}`,
  });
});

// ---------------------------------------------------------------------
// GET /api/payhere/checkout/:orderId
// Serves a bare HTML page that auto-submits PayHere's hosted checkout form.
// This is what the RN app's WebView loads — the user completes payment on
// PayHere's own sandbox page, inside the WebView.
// ---------------------------------------------------------------------
app.get('/api/payhere/checkout/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) return res.status(404).send('Order not found');

  const amountFormatted = formatAmount(order.amount);
  const hash = generateHash(order.orderId, amountFormatted, order.currency);

  const returnUrl = `${PUBLIC_BASE_URL}/api/payhere/return?orderId=${order.orderId}`;
  const cancelUrl = `${PUBLIC_BASE_URL}/api/payhere/cancel?orderId=${order.orderId}`;
  const notifyUrl = `${PUBLIC_BASE_URL}/api/payhere/notify`;

  res.send(`
    <!DOCTYPE html>
    <html>
      <body onload="document.forms[0].submit()">
        <form method="post" action="https://sandbox.payhere.lk/pay/checkout">
          <input type="hidden" name="merchant_id" value="${PAYHERE_MERCHANT_ID}" />
          <input type="hidden" name="return_url" value="${returnUrl}" />
          <input type="hidden" name="cancel_url" value="${cancelUrl}" />
          <input type="hidden" name="notify_url" value="${notifyUrl}" />
          <input type="hidden" name="order_id" value="${order.orderId}" />
          <input type="hidden" name="items" value="EstateGo Property Listing Fee" />
          <input type="hidden" name="currency" value="${order.currency}" />
          <input type="hidden" name="amount" value="${amountFormatted}" />
          <input type="hidden" name="first_name" value="${order.customer.firstName}" />
          <input type="hidden" name="last_name" value="${order.customer.lastName}" />
          <input type="hidden" name="email" value="${order.customer.email}" />
          <input type="hidden" name="phone" value="${order.customer.phone}" />
          <input type="hidden" name="address" value="${order.customer.address}" />
          <input type="hidden" name="city" value="${order.customer.city}" />
          <input type="hidden" name="country" value="${order.customer.country}" />
          <input type="hidden" name="hash" value="${hash}" />
        </form>
        <p style="font-family: sans-serif; text-align: center; margin-top: 40px;">Redirecting to PayHere...</p>
      </body>
    </html>
  `);
});

// ---------------------------------------------------------------------
// POST /api/payhere/notify  (server-to-server — called by PayHere, not the app)
// This is the ONLY trustworthy source of truth for whether payment actually
// succeeded. Verifies the signature using the merchant secret before
// believing anything.
// ---------------------------------------------------------------------
app.post('/api/payhere/notify', (req, res) => {
  const {
    merchant_id,
    order_id,
    payhere_amount,
    payhere_currency,
    status_code,
    md5sig,
  } = req.body;

  const order = orders.get(order_id);
  if (!order) {
    console.warn(`[PayHere notify] Unknown order_id: ${order_id}`);
    return res.status(404).send('Unknown order');
  }

  const secretHash = md5(PAYHERE_MERCHANT_SECRET).toUpperCase();
  const localSig = md5(
    `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${secretHash}`
  ).toUpperCase();

  if (localSig !== md5sig) {
    console.warn(`[PayHere notify] Signature mismatch for order ${order_id} — ignoring.`);
    return res.status(400).send('Invalid signature');
  }

  // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
  if (status_code === '2') {
    order.status = 'paid';
    order.paidAt = new Date().toISOString();
    console.log(`[PayHere notify] Order ${order_id} confirmed PAID.`);
  } else {
    order.status = 'failed';
    console.log(`[PayHere notify] Order ${order_id} status_code=${status_code} — marked failed.`);
  }

  res.status(200).send('OK');
});

// ---------------------------------------------------------------------
// GET /api/payhere/order/:orderId  — the RN app polls this after the
// WebView redirects back, to find out what the notify webhook decided.
// ---------------------------------------------------------------------
app.get('/api/payhere/order/:orderId', (req, res) => {
  const order = orders.get(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ orderId: order.orderId, status: order.status });
});

// Simple landing pages the WebView briefly lands on before the RN app takes
// over (it detects these URLs via onNavigationStateChange and closes the
// WebView) — the actual payment confirmation always comes from /notify above,
// never from the user reaching this page, since a user could fake a redirect.
app.get('/api/payhere/return', (req, res) => {
  res.send('<html><body style="font-family:sans-serif;text-align:center;margin-top:40px;">Payment complete — you can close this window.</body></html>');
});
app.get('/api/payhere/cancel', (req, res) => {
  res.send('<html><body style="font-family:sans-serif;text-align:center;margin-top:40px;">Payment cancelled — you can close this window.</body></html>');
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'estategoNumbergo-payhere-server' });
});

app.listen(PORT, () => {
  console.log(`PayHere server running on http://localhost:${PORT}`);
  console.log(`Public base URL configured as: ${PUBLIC_BASE_URL || '(not set)'}`);
});

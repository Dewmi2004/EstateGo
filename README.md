# EstateGo

A React Native (Expo SDK 54) property listing app — browse, post, favorite, and pay for real-estate listings, with a built-in assistant, multi-language support, and a real payment gateway integration.

## Tech Stack

- **Framework:** Expo SDK 54 (React Native 0.81.5, React 19.1.0)
- **Language:** TypeScript
- **State management:** Redux Toolkit + React-Redux
- **Navigation:** React Navigation (native-stack + bottom-tabs)
- **UI kit:** React Native Paper
- **HTTP:** Axios (against a custom local mock adapter — see below)
- **Local persistence:** AsyncStorage
- **Backend (payments only):** Standalone Express server (`/server`)

---

## Features

### 🔐 Authentication
Login and registration screens backed by Redux (`authSlice.ts`) with async thunks (`loginUser`, `registerUser`, `logoutUser`, `bootstrapAuth`). Session state is checked on app launch so returning users skip straight past the login screen.

### 🏠 Property Listings
Browse, search, and filter available properties (`PropertyListScreen`), view full details with images, pricing, and specs (`PropertyDetailsScreen`), and post/edit your own listing (`PropertyFormScreen`) — including photo upload. Full CRUD is wired through `propertySlice.ts` (`fetchProperties`, `fetchPropertyById`, `createProperty`, `updateProperty`, `deleteProperty`).

### ⭐ Favorites
Save properties to a personal favorites list (`FavoritesScreen`), backed by `favoriteSlice.ts` (`fetchFavorites`, `toggleFavorite`).

### 📷 Camera & Photo Upload
`ImagePickerField` component (used in the property form) lets users either **take a new photo** or **choose one from their gallery** via `expo-image-picker`, with permission handling for both camera and photo-library access. Camera capture gracefully falls back to a file picker on web, where native camera launch isn't supported.

### 📍 Directions to Google Maps
On the property details screen, tapping the location card or the "Directions" button opens the device's **Google Maps app** (or browser) with the property's address pre-filled, via a `Linking.openURL()` deep link to `google.com/maps/search`. There's no embedded in-app map view — this is a one-tap handoff to Maps, similar to the Call and Email buttons on the same screen.

### 💬 EstateBot (Rule-Based Assistant)
A **local, keyword/regex-based** chat assistant (`estateBotService.ts`) — not an external AI API. It pattern-matches the user's message against a fixed set of intents and replies using live data from the properties already loaded in Redux:
- Property recommendations (by bedroom count / budget)
- Budget-based suggestions
- Investment tips (ranked by price-per-sqft)
- Side-by-side comparison of two named listings
- A first-time buyer roadmap
- FAQ answers for terms like *mortgage*, *freehold*, *condominium*, and required purchase documents

It runs entirely on-device with no network call, no API key, and no usage limit. The code is intentionally isolated in a single service file so it can be swapped for a real LLM integration (e.g. Google AI Studio/Gemini or OpenAI) later without touching the Redux slice or the chat screen UI — that swap has **not** been done yet in this build; today it's pattern matching, not AI.

### 💳 Payments — simulated by default, real gateway available but not currently active
`PaymentScreen` is built to load PayHere's real sandbox checkout inside a WebView, but **out of the box this repo runs in simulated payment mode**, not a live gateway. This is controlled by a single flag:

```ts
// src/config/env.ts
export const PAYHERE_BACKEND_URL = 'https://your-ngrok-subdomain.ngrok-free.app'; // placeholder
export const isPayHereConfigured = () => !PAYHERE_BACKEND_URL.includes('your-ngrok-subdomain');
```

Since `PAYHERE_BACKEND_URL` is still the placeholder, `isPayHereConfigured()` returns `false`, and `PaymentScreen` uses the in-memory `paymentStore` mock (see below) to fake a "paid" order instead of hitting PayHere.

**To make it real:**
1. Create a free PayHere sandbox account at `sandbox.payhere.lk` and get a Merchant ID + Merchant Secret.
2. Run the `/server` Express backend with those credentials — this is required because generating PayHere's request hash and verifying its webhook both need the merchant secret, which can never be safely bundled into a mobile app.
3. Expose that server publicly (ngrok for local testing, or deploy it — e.g. Render).
4. Set `PAYHERE_BACKEND_URL` to that server's URL.

Once configured, `PaymentScreen` automatically switches from the simulation to PayHere's real hosted checkout — no other code changes needed. Even then, this is PayHere's **sandbox** environment (test cards, no real money) — going fully live additionally requires swapping `sandbox.payhere.lk` → `www.payhere.lk` in `server/index.js` and using live merchant credentials.

| Endpoint (real server, `/server`) | Called by | Purpose |
|---|---|---|
| `POST /api/payhere/order` | App | Creates an order, returns a checkout URL |
| `GET /api/payhere/checkout/:orderId` | App's WebView | Auto-submits PayHere's hosted checkout form |
| `POST /api/payhere/notify` | PayHere (server-to-server) | Confirms payment via signature verification |
| `GET /api/payhere/order/:orderId` | App | Polls payment status after redirect |

### 🔔 Notifications
Local (on-device) push notifications via `expo-notifications` for three categories: new property alerts, payment updates, and EstateBot replies. Each category can be toggled independently in Settings. This is local-only — there's no remote push server or device-token flow.

### 🌗 Theming
Light/dark/system theme modes (`useThemeColors`, `theme.ts`), togglable from Settings and persisted to device storage.

### 🌐 Multi-Language Support (i18n)
A lightweight, in-house translation system (no external i18n library) supporting **English, Sinhala, and Tamil**, with a dictionary per language and dotted-path lookups wired to Redux (`settings.language`).

### ⚙️ Settings
Central screen for theme mode, language, and per-category notification toggles — all persisted to `AsyncStorage` so preferences survive app restarts.

### 👤 Profile
View and edit user profile details (`ProfileScreen`).

### 📱 Responsive / Cross-Platform
Runs on iOS, Android, and Web from a single codebase. On web, the app renders inside a phone-sized frame rather than stretching full-width. Scaling utilities (`responsive.ts`) keep layout consistent across device sizes.

### 🗄️ Mock Backend Layer (`src/services/msw`)
Outside of the optional PayHere payment flow, **the app has no real backend at all.** Every API call — auth, properties, favorites, profile, and payment simulation — is intercepted by a custom Axios adapter (`mockAdapter.ts`) that fakes a real API entirely **in-memory, on-device**, with an artificial ~400ms network delay so it feels realistic. Nothing is written to disk or a database — **all mock data resets every time the app reloads.**

> Note: this is a hand-rolled adapter, not the `msw` (Mock Service Worker) library — `msw`'s browser/native interceptors rely on DOM-only APIs that crash under React Native's Hermes engine, so this project uses a plain TypeScript adapter instead, with identical behavior on iOS, Android, and Web.

Each domain has its own in-memory "store" object with CRUD-style methods, called by `mockAdapter.ts`:

**`db.ts` — Users**
- `list()` — all seeded users
- `findByEmail()` / `findById()` — lookups used by login/session
- `create(name, email, password)` — used by Register
- `update(id, patch)` — used by Profile edits
- Seeded with one demo account: `demo@estategoNumbergo.com` / `password123`
- Also issues mock JWTs (`mockJwt.ts`) and reads them back off request headers (`authFromRequest.ts`) to simulate authenticated requests

**`propertyStore.ts` — Properties (full CRUD)**
- `list(filters, userId)` — filtered + sorted (newest first)
- `getById(id)` — throws a mock 404 if missing
- `create(input, ownerId, paymentOrderId)` — validates required fields, **and blocks listing creation unless a matching payment order has already been marked paid** (`paymentStore.isPaid()`) — this is where the payment flow and property flow connect
- `update(id, input, userId)` — only the listing's owner can edit (mock 403 otherwise)
- `remove(id, userId)` — only the owner can delete (mock 403 otherwise)
- Seeded with a set of starter listings (`mockProperties.ts`)

**`favoriteStore.ts` — Favorites (CRUD, per user)**
- `list(userId)` — a user's favorited property IDs
- `add(userId, propertyId)` / `remove(userId, propertyId)`
- `isFavorite(userId, propertyId)`
- Stored as a `Map<userId, Set<propertyId>>` — no cross-user leakage

**`paymentStore.ts` — Payment orders (mock lifecycle, stands in for PayHere)**
- `createOrder(userId)` — creates a `pending` order for the fixed listing fee
- `getOrder(orderId)`
- `markPaid(orderId, userId)` — simulates PayHere's server-to-server "notify" webhook confirming payment; ownership-checked (mock 403 if the order isn't yours)
- `isPaid(orderId, userId)` — checked by `propertyStore.create()` before allowing a new listing

All four stores throw typed mock errors (`PropertyError`, `PaymentError`, etc.) with realistic HTTP status codes (`401`, `403`, `404`, `402`), so the app's error-handling code behaves the same as it would against a real backend — which means swapping this mock layer out for a real API later should be a drop-in replacement, not a rewrite.

**Why a mock layer at all:** it lets the whole app — auth, listings, favorites, profile — run and demo fully offline with zero backend setup, while keeping only the one thing that *must* be real (PayHere's merchant secret) on an actual server.

---

## Project Structure

```
EstateGo/
├── App.tsx                  # Root component — Redux Provider, theming, font loading
├── server/                  # Standalone Express server (PayHere payment integration only)
└── src/
    ├── redux/                # Redux Toolkit store + slices (auth, property, favorite, chatbot, payment, settings)
    ├── screens/               # Auth, home, property, favorites, chatbot, payment, settings, profile
    ├── navigation/            # React Navigation stacks/tabs
    ├── services/
    │   ├── api/               # Axios API modules per domain
    │   ├── msw/                # Local mock backend (no real server, except payments)
    │   ├── chatbot/            # EstateBot rule-based response engine
    │   └── notifications/     # Local push notification helper
    ├── components/            # Shared UI (ImagePickerField, PropertyCard, Input, ChipSelector, etc.)
    ├── theme/                 # Colors, typography, light/dark theme
    ├── i18n/                  # English / Sinhala / Tamil translations
    ├── hooks/                 # Typed Redux hooks, font loading
    ├── config/                # Environment config (PayHere backend URL)
    ├── types/                 # Shared TypeScript types
    └── utils/                 # Currency formatting, responsive scaling helpers
```

---

## Getting Started

```bash
npm install
npx expo start
```

Then choose a platform:
```bash
npm run android   # Android
npm run ios       # iOS
npm run web       # Web
```

### Optional: enable real PayHere payments
By default this repo runs with **simulated payments only** (no real gateway is active — see the Payments section above). To use PayHere's real sandbox checkout, follow the setup guide in [`server/README.md`](./server/README.md), run the `/server` backend, and point the app at it via `src/config/env.ts`.

### Note on EstateBot
The in-app assistant is currently a local rule-based responder, not a live AI model. If you want to upgrade it to a real Google AI Studio (Gemini) or OpenAI integration, only `src/services/chatbot/estateBotService.ts` needs to change — the Redux slice and chat screen are already built to support that swap.

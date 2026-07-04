// src/services/msw/handlers.ts
// Mock REST API. Matches the endpoints described in the coursework spec:
// auth (POST /login, /register, /logout) and property CRUD + favorites
// (Section 16 of the spec doc).

import { http, HttpResponse, delay } from 'msw';
import { usersDb } from './db';
import { generateMockToken } from './mockJwt';
import { getUserIdFromAuthHeader } from './authFromRequest';
import { propertyStore, PropertyError } from './propertyStore';
import { favoriteStore } from './favoriteStore';
import { paymentStore, PaymentError } from './paymentStore';
import { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth.types';
import { PropertyFilters, PropertyFormInput } from '@/types/property.types';

const API_DELAY_MS = 500; // simulate network latency

function parsePropertyFilters(url: URL): PropertyFilters {
  const params = url.searchParams;
  return {
    search: params.get('search') ?? undefined,
    city: params.get('city') ?? undefined,
    propertyType: (params.get('propertyType') as PropertyFilters['propertyType']) ?? undefined,
    minPrice: params.get('minPrice') ? Number(params.get('minPrice')) : undefined,
    maxPrice: params.get('maxPrice') ? Number(params.get('maxPrice')) : undefined,
    bedrooms: params.get('bedrooms') ? Number(params.get('bedrooms')) : undefined,
    mine: params.get('mine') === 'true',
  };
}

export const handlers = [
  // ---------- Auth ----------
  http.post('*/login', async ({ request }) => {
    await delay(API_DELAY_MS);
    const body = (await request.json()) as LoginPayload;

    if (!body.email || !body.password) {
      return HttpResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const storedUser = usersDb.findByEmail(body.email);

    if (!storedUser || storedUser.password !== body.password) {
      return HttpResponse.json({ message: 'Invalid email or password' }, { status: 401 });
    }

    const user = usersDb.toPublicUser(storedUser);
    const { accessToken, expiresAt } = generateMockToken(user);

    const response: AuthResponse = { user, accessToken, expiresAt };
    return HttpResponse.json(response, { status: 200 });
  }),

  http.post('*/register', async ({ request }) => {
    await delay(API_DELAY_MS);
    const body = (await request.json()) as RegisterPayload;

    if (!body.name || !body.email || !body.password) {
      return HttpResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
    }

    if (usersDb.findByEmail(body.email)) {
      return HttpResponse.json({ message: 'An account with this email already exists' }, { status: 409 });
    }

    const storedUser = usersDb.create(body.name, body.email, body.password);
    const user = usersDb.toPublicUser(storedUser);
    const { accessToken, expiresAt } = generateMockToken(user);

    const response: AuthResponse = { user, accessToken, expiresAt };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.post('*/logout', async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Logged out' }, { status: 200 });
  }),

  // ---------- Properties ----------
  http.get('*/properties', async ({ request }) => {
    await delay(API_DELAY_MS);
    const url = new URL(request.url);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    const filters = parsePropertyFilters(url);
    const list = propertyStore.list(filters, userId);
    return HttpResponse.json(list, { status: 200 });
  }),

  http.get('*/properties/:id', async ({ params }) => {
    await delay(300);
    try {
      const property = propertyStore.getById(String(params.id));
      return HttpResponse.json(property, { status: 200 });
    } catch (err) {
      const e = err as PropertyError;
      return HttpResponse.json({ message: e.message }, { status: e.status ?? 500 });
    }
  }),

  http.post('*/properties', async ({ request }) => {
    await delay(API_DELAY_MS);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    const body = (await request.json()) as PropertyFormInput & { paymentOrderId?: string };
    const { paymentOrderId, ...propertyInput } = body;
    try {
      const created = propertyStore.create(propertyInput, userId, paymentOrderId ?? null);
      return HttpResponse.json(created, { status: 201 });
    } catch (err) {
      const e = err as PropertyError;
      return HttpResponse.json({ message: e.message }, { status: e.status ?? 500 });
    }
  }),

  http.put('*/properties/:id', async ({ request, params }) => {
    await delay(API_DELAY_MS);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    const body = (await request.json()) as Partial<PropertyFormInput>;
    try {
      const updated = propertyStore.update(String(params.id), body, userId);
      return HttpResponse.json(updated, { status: 200 });
    } catch (err) {
      const e = err as PropertyError;
      return HttpResponse.json({ message: e.message }, { status: e.status ?? 500 });
    }
  }),

  http.delete('*/properties/:id', async ({ request, params }) => {
    await delay(API_DELAY_MS);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    try {
      propertyStore.remove(String(params.id), userId);
      return HttpResponse.json({ message: 'Property deleted' }, { status: 200 });
    } catch (err) {
      const e = err as PropertyError;
      return HttpResponse.json({ message: e.message }, { status: e.status ?? 500 });
    }
  }),

  // ---------- Favorites ----------
  http.get('*/favorites', async ({ request }) => {
    await delay(300);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(favoriteStore.list(userId), { status: 200 });
  }),

  http.post('*/favorites', async ({ request }) => {
    await delay(200);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = (await request.json()) as { propertyId: string };
    favoriteStore.add(userId, body.propertyId);
    return HttpResponse.json({ message: 'Added to favorites' }, { status: 201 });
  }),

  http.delete('*/favorites/:id', async ({ request, params }) => {
    await delay(200);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    favoriteStore.remove(userId, String(params.id));
    return HttpResponse.json({ message: 'Removed from favorites' }, { status: 200 });
  }),

  // ---------- Payments (PayHere-style mock checkout) ----------
  http.post('*/payments/checkout', async ({ request }) => {
    await delay(400);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const order = paymentStore.createOrder(userId);
    return HttpResponse.json(order, { status: 201 });
  }),

  http.get('*/payments/:orderId', async ({ request, params }) => {
    await delay(200);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    try {
      const order = paymentStore.getOrder(String(params.orderId));
      if (order.userId !== userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
      return HttpResponse.json(order, { status: 200 });
    } catch (err) {
      const e = err as PaymentError;
      return HttpResponse.json({ message: e.message }, { status: e.status ?? 500 });
    }
  }),

  // Stands in for PayHere redirecting back + firing its server-to-server
  // notify webhook once the sandbox/live checkout actually completes.
  http.post('*/payments/:orderId/confirm', async ({ request, params }) => {
    await delay(1200); // simulate the gateway processing time
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    try {
      const order = paymentStore.markPaid(String(params.orderId), userId);
      return HttpResponse.json(order, { status: 200 });
    } catch (err) {
      const e = err as PaymentError;
      return HttpResponse.json({ message: e.message }, { status: e.status ?? 500 });
    }
  }),

  // ---------- Profile ----------
  http.get('*/profile', async ({ request }) => {
    await delay(300);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    const user = userId ? usersDb.findById(userId) : undefined;
    if (!user) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return HttpResponse.json(usersDb.toPublicUser(user), { status: 200 });
  }),

  http.put('*/profile', async ({ request }) => {
    await delay(API_DELAY_MS);
    const userId = getUserIdFromAuthHeader(request.headers.get('authorization'));
    if (!userId) return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const body = (await request.json()) as { name?: string; email?: string };
    const updated = usersDb.update(userId, body);
    if (!updated) return HttpResponse.json({ message: 'User not found' }, { status: 404 });
    return HttpResponse.json(usersDb.toPublicUser(updated), { status: 200 });
  }),
];

// src/services/msw/webMockAdapter.ts
// Web-only mock transport. Avoids msw/browser entirely (its bundle doesn't
// play well with Metro's Babel target — see project notes). This is a thin
// wrapper: all the actual data logic lives in propertyStore.ts,
// favoriteStore.ts and db.ts, shared with the native msw/native handlers in
// handlers.ts, so both platforms behave identically.

import type { AxiosAdapter, AxiosResponse } from 'axios';
import { usersDb } from './db';
import { generateMockToken } from './mockJwt';
import { getUserIdFromAuthHeader } from './authFromRequest';
import { propertyStore, PropertyError } from './propertyStore';
import { favoriteStore } from './favoriteStore';
import { paymentStore, PaymentError } from './paymentStore';
import { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth.types';
import { PropertyFilters, PropertyFormInput } from '@/types/property.types';

const DELAY_MS = 400;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ok<T>(data: T, status: number, config: any): AxiosResponse<T> {
  return { data, status, statusText: String(status), headers: {}, config } as AxiosResponse<T>;
}

function fail(message: string, status: number, config: any) {
  const error: any = new Error(message);
  error.response = ok({ message }, status, config);
  return error;
}

function parseBody(config: any): any {
  if (!config.data) return {};
  return typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
}

function parseFilters(config: any): PropertyFilters {
  const params = config.params ?? {};
  return {
    search: params.search,
    city: params.city,
    propertyType: params.propertyType,
    minPrice: params.minPrice !== undefined ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice !== undefined ? Number(params.maxPrice) : undefined,
    bedrooms: params.bedrooms !== undefined ? Number(params.bedrooms) : undefined,
    mine: params.mine === true || params.mine === 'true',
  };
}

function getAuthHeader(config: any): string | undefined {
  return config.headers?.Authorization ?? config.headers?.authorization;
}

export const webMockAdapter: AxiosAdapter = async (config) => {
  await wait(DELAY_MS);

  const method = (config.method ?? 'get').toLowerCase();
  const url: string = config.url ?? '';
  const userId = getUserIdFromAuthHeader(getAuthHeader(config));

  // ---------- Auth ----------
  if (method === 'post' && url.endsWith('/login')) {
    const { email, password } = parseBody(config) as LoginPayload;
    if (!email || !password) throw fail('Email and password are required', 400, config);

    const storedUser = usersDb.findByEmail(email);
    if (!storedUser || storedUser.password !== password) {
      throw fail('Invalid email or password', 401, config);
    }
    const user = usersDb.toPublicUser(storedUser);
    const { accessToken, expiresAt } = generateMockToken(user);
    const response: AuthResponse = { user, accessToken, expiresAt };
    return ok(response, 200, config);
  }

  if (method === 'post' && url.endsWith('/register')) {
    const { name, email, password } = parseBody(config) as RegisterPayload;
    if (!name || !email || !password) {
      throw fail('Name, email and password are required', 400, config);
    }
    if (usersDb.findByEmail(email)) {
      throw fail('An account with this email already exists', 409, config);
    }
    const storedUser = usersDb.create(name, email, password);
    const user = usersDb.toPublicUser(storedUser);
    const { accessToken, expiresAt } = generateMockToken(user);
    const response: AuthResponse = { user, accessToken, expiresAt };
    return ok(response, 201, config);
  }

  if (method === 'post' && url.endsWith('/logout')) {
    return ok({ message: 'Logged out' }, 200, config);
  }

  // ---------- Profile ----------
  if (url.endsWith('/profile')) {
    const user = userId ? usersDb.findById(userId) : undefined;
    if (!user) throw fail('Unauthorized', 401, config);

    if (method === 'get') {
      return ok(usersDb.toPublicUser(user), 200, config);
    }
    if (method === 'put') {
      const patch = parseBody(config) as { name?: string; email?: string };
      const updated = usersDb.update(user.id, patch);
      return ok(usersDb.toPublicUser(updated!), 200, config);
    }
  }

  // ---------- Favorites ----------
  if (url.endsWith('/favorites')) {
    if (!userId) throw fail('Unauthorized', 401, config);

    if (method === 'get') {
      return ok(favoriteStore.list(userId), 200, config);
    }
    if (method === 'post') {
      const { propertyId } = parseBody(config) as { propertyId: string };
      favoriteStore.add(userId, propertyId);
      return ok({ message: 'Added to favorites' }, 201, config);
    }
  }

  const favoriteMatch = url.match(/\/favorites\/([^/]+)$/);
  if (favoriteMatch && method === 'delete') {
    if (!userId) throw fail('Unauthorized', 401, config);
    favoriteStore.remove(userId, favoriteMatch[1]);
    return ok({ message: 'Removed from favorites' }, 200, config);
  }

  // ---------- Payments (PayHere-style mock checkout) ----------
  if (url.endsWith('/payments/checkout') && method === 'post') {
    if (!userId) throw fail('Unauthorized', 401, config);
    return ok(paymentStore.createOrder(userId), 201, config);
  }

  const paymentConfirmMatch = url.match(/\/payments\/([^/]+)\/confirm$/);
  if (paymentConfirmMatch && method === 'post') {
    await wait(800); // simulate gateway processing time
    if (!userId) throw fail('Unauthorized', 401, config);
    try {
      return ok(paymentStore.markPaid(paymentConfirmMatch[1], userId), 200, config);
    } catch (err) {
      const e = err as PaymentError;
      throw fail(e.message, e.status ?? 500, config);
    }
  }

  const paymentGetMatch = url.match(/\/payments\/([^/]+)$/);
  if (paymentGetMatch && method === 'get') {
    try {
      const order = paymentStore.getOrder(paymentGetMatch[1]);
      if (order.userId !== userId) throw fail('Unauthorized', 401, config);
      return ok(order, 200, config);
    } catch (err) {
      const e = err as PaymentError;
      throw fail(e.message, e.status ?? 500, config);
    }
  }

  // ---------- Properties ----------
  const propertyIdMatch = url.match(/\/properties\/([^/]+)$/);

  if (propertyIdMatch) {
    const id = propertyIdMatch[1];
    try {
      if (method === 'get') {
        return ok(propertyStore.getById(id), 200, config);
      }
      if (method === 'put') {
        const body = parseBody(config) as Partial<PropertyFormInput>;
        return ok(propertyStore.update(id, body, userId), 200, config);
      }
      if (method === 'delete') {
        propertyStore.remove(id, userId);
        return ok({ message: 'Property deleted' }, 200, config);
      }
    } catch (err) {
      const e = err as PropertyError;
      throw fail(e.message, e.status ?? 500, config);
    }
  }

  if (url.endsWith('/properties')) {
    try {
      if (method === 'get') {
        const filters = parseFilters(config);
        return ok(propertyStore.list(filters, userId), 200, config);
      }
      if (method === 'post') {
        const body = parseBody(config) as PropertyFormInput & { paymentOrderId?: string };
        const { paymentOrderId, ...propertyInput } = body;
        return ok(propertyStore.create(propertyInput, userId, paymentOrderId ?? null), 201, config);
      }
    } catch (err) {
      const e = err as PropertyError;
      throw fail(e.message, e.status ?? 500, config);
    }
  }

  throw fail(`No mock handler for ${method.toUpperCase()} ${url}`, 404, config);
};

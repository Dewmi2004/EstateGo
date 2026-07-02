// src/services/msw/webMockAdapter.ts
// Lightweight mock for web only. Avoids msw/browser entirely (its bundle
// doesn't play well with Metro's Babel target). Reuses the same mock DB
// and mock JWT logic as the native MSW handlers, just without MSW itself.

import type { AxiosAdapter, AxiosResponse } from 'axios';
import { usersDb } from './db';
import { generateMockToken } from './mockJwt';
import { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth.types';

const DELAY_MS = 500;

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeResponse<T>(data: T, status: number, config: any): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: String(status),
    headers: {},
    config,
  } as AxiosResponse<T>;
}

function makeError(message: string, status: number, config: any) {
  const error: any = new Error(message);
  error.response = makeResponse({ message }, status, config);
  return error;
}

export const webMockAdapter: AxiosAdapter = async (config) => {
  await wait(DELAY_MS);

  const url = config.url ?? '';
  const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;

  if (url.endsWith('/login')) {
    const { email, password } = body as LoginPayload;
    if (!email || !password) throw makeError('Email and password are required', 400, config);

    const storedUser = usersDb.findByEmail(email);
    if (!storedUser || storedUser.password !== password) {
      throw makeError('Invalid email or password', 401, config);
    }

    const user = usersDb.toPublicUser(storedUser);
    const { accessToken, expiresAt } = generateMockToken(user);
    const response: AuthResponse = { user, accessToken, expiresAt };
    return makeResponse(response, 200, config);
  }

  if (url.endsWith('/register')) {
    const { name, email, password } = body as RegisterPayload;
    if (!name || !email || !password) {
      throw makeError('Name, email and password are required', 400, config);
    }
    if (usersDb.findByEmail(email)) {
      throw makeError('An account with this email already exists', 409, config);
    }

    const storedUser = usersDb.create(name, email, password);
    const user = usersDb.toPublicUser(storedUser);
    const { accessToken, expiresAt } = generateMockToken(user);
    const response: AuthResponse = { user, accessToken, expiresAt };
    return makeResponse(response, 201, config);
  }

  if (url.endsWith('/logout')) {
    return makeResponse({ message: 'Logged out' }, 200, config);
  }

  throw makeError(`No mock handler for ${url}`, 404, config);
};
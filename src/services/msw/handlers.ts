// src/services/msw/handlers.ts
// Mock REST API for authentication. Matches the endpoints described in the
// coursework spec: POST /login, POST /register, POST /logout.

import { http, HttpResponse, delay } from 'msw';
import { usersDb } from './db';
import { generateMockToken } from './mockJwt';
import { LoginPayload, RegisterPayload, AuthResponse } from '@/types/auth.types';

const API_DELAY_MS = 600; // simulate network latency

export const handlers = [
  // POST /login
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

  // POST /register
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

  // POST /logout
  http.post('*/logout', async () => {
    await delay(200);
    return HttpResponse.json({ message: 'Logged out' }, { status: 200 });
  }),
];

// src/services/msw/mockJwt.ts
// Generates and decodes a FAKE JWT-shaped token for the mock backend.
// This is NOT cryptographically signed - it only mimics the header.payload.signature
// shape so the rest of the app (token storage, expiry checks, auth header) behaves
// exactly like it would against a real JWT backend. Swap for a real backend later.

import { User } from '@/types/auth.types';

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function base64UrlEncode(obj: unknown): string {
  const json = JSON.stringify(obj);
  // btoa is available in the JS engine used by Expo/React Native for MSW's Node-based runtime
  const base64 = typeof btoa !== 'undefined' ? btoa(json) : Buffer.from(json).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  return typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf-8');
}

export function generateMockToken(user: User): { accessToken: string; expiresAt: number } {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + TOKEN_TTL_MS;

  const header = base64UrlEncode({ alg: 'mock256', typ: 'JWT' });
  const payload = base64UrlEncode({
    sub: user.id,
    email: user.email,
    name: user.name,
    iat: issuedAt,
    exp: expiresAt,
  });
  const signature = base64UrlEncode({ mock: true });

  return {
    accessToken: `${header}.${payload}.${signature}`,
    expiresAt,
  };
}

export function decodeMockToken(token: string): { exp: number; sub: string } | null {
  try {
    const [, payload] = token.split('.');
    const decoded = JSON.parse(base64UrlDecode(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

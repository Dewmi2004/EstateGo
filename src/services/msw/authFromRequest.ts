// src/services/msw/authFromRequest.ts
// Pulls the logged-in user's id out of the mock JWT sent in the
// Authorization header. Shared by both the native MSW handlers and the
// web mock adapter so "my properties" / favorites ownership checks behave
// identically on every platform.

import { decodeMockToken } from './mockJwt';

export function getUserIdFromAuthHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;
  const decoded = decodeMockToken(token);
  return decoded?.sub ?? null;
}

// src/services/msw/mockServer.web.ts
// No-op on web. Web doesn't need a mock server started at all — auth mocking
// is handled directly in axiosInstance.ts via webMockAdapter, which has no
// msw dependency and no bundling issues.

export function startMockServer(): void {
  // Intentionally empty.
}

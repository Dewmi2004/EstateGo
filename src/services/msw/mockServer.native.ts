// src/services/msw/mockServer.native.ts
// Starts the MSW mock server for React Native using msw/native. This file
// only gets bundled on Android/iOS thanks to the .native.ts extension —
// Metro resolves a completely different file for web (mockServer.web.ts),
// so msw's browser-incompatible dependencies never reach the web bundle.
// Only started in development builds - see App.tsx.

import { setupServer } from 'msw/native';
import { handlers } from './handlers';

export const mswServer = setupServer(...handlers);

export function startMockServer(): void {
  if (__DEV__) {
    mswServer.listen({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mock server started');
  }
}

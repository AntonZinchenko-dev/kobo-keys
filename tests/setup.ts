import { cleanup } from '@testing-library/react';

import { server } from '@mocks/node';

import '@testing-library/jest-dom/vitest';

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
});
afterAll(() => server.close());

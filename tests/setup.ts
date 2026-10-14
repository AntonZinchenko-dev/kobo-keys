import { cleanup } from '@testing-library/react';

import { server } from '@mocks/node';

import '@testing-library/jest-dom/vitest';

// jsdom has no layout: scrolling an element into view is a no-op there
Element.prototype.scrollIntoView = function scrollIntoView() {
  // noop
};

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
  localStorage.clear();
});
afterAll(() => server.close());

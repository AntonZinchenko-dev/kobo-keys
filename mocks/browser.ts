import { setupWorker } from 'msw/browser';

import { loadDb } from './db/store';
import { handlers } from './handlers';

/**
 * Starts the mock backend. It runs in production too — on GitHub Pages there is no server,
 * the service worker answers every /api/* request right in the visitor's browser.
 */
export const startMockBackend = async () => {
  await loadDb();
  const worker = setupWorker(...handlers);
  await worker.start({
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
    onUnhandledRequest: 'bypass',
    quiet: import.meta.env.PROD,
  });
  return worker;
};

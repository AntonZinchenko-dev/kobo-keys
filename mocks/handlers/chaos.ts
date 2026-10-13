import { delay, http, HttpResponse } from 'msw';

import { LATENCY_MS, readDevSettings } from '../dev-settings';
import { API, fail } from './utils';

const isTest = import.meta.env.MODE === 'test';

/**
 * Runs before every API handler. Returning nothing lets MSW continue to the real handler,
 * so latency, random errors and offline mode apply to the whole mock backend at once.
 */
export const chaosHandler = http.all(`${API}/*`, async ({ request }) => {
  if (isTest) return;
  const settings = readDevSettings();
  if (settings.offline) return HttpResponse.error();

  const [min, max] = LATENCY_MS[settings.latency];
  await delay(min + Math.random() * (max - min));

  const url = new URL(request.url);
  // Never break the dev panel's own reset endpoint or exchange rates (the whole UI relies on them).
  const exempt = url.pathname.endsWith('/__reset') || url.pathname.endsWith('/rates');
  if (!exempt && settings.errorRate > 0 && Math.random() < settings.errorRate) {
    return fail(503, 'SERVICE_UNAVAILABLE');
  }
  return undefined;
});

import { expect, test as base } from '@playwright/test';

/** Every test starts with a fast, reliable mock network and clean demo data. */
export const test = base.extend({
  page: async ({ page }, run) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('e2e-init')) return;
      sessionStorage.setItem('e2e-init', '1');
      localStorage.clear();
      localStorage.setItem(
        'kobo-dev-settings',
        JSON.stringify({ latency: 'fast', errorRate: 0, offline: false, scenario: 'none' }),
      );
    });
    await run(page);
  },
});

export { expect };

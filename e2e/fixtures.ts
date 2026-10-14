import { expect, test as base } from '@playwright/test';

interface Options {
  /** Sign in with the demo account before the test (the whole shop is behind the sign-in screen) */
  authenticated: boolean;
}

/** Every test starts with a fast, reliable mock network and clean demo data. */
export const test = base.extend<Options>({
  authenticated: [true, { option: true }],
  page: async ({ page, authenticated }, run) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('e2e-init')) return;
      sessionStorage.setItem('e2e-init', '1');
      localStorage.clear();
      localStorage.setItem(
        'kobo-dev-settings',
        JSON.stringify({ latency: 'fast', errorRate: 0, offline: false, scenario: 'none' }),
      );
    });
    if (authenticated) {
      await page.goto('en/login');
      await page.getByRole('button', { name: 'Enter the demo account' }).click();
      await expect(page).toHaveURL(/\/en$/);
      // Park the pointer: a hovered product card dims its neighbours, which would skew contrast checks
      await page.mouse.move(0, 0);
    }
    await run(page);
  },
});

export { expect };

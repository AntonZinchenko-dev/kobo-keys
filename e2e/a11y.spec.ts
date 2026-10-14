import AxeBuilder from '@axe-core/playwright';

import { expect, test } from './fixtures';

const PAGES = ['en', 'en/catalog', 'en/product/sakura-65', 'en/builder', 'en/club', 'en/checkout'];

for (const path of PAGES) {
  test(`no serious accessibility violations on /${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .exclude('[data-dev-panel]')
      .analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}

test.describe('sign-in screen', () => {
  test.use({ authenticated: false });

  test('no serious accessibility violations on /en/login', async ({ page }) => {
    await page.goto('en/login');
    await page.waitForLoadState('networkidle');
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .exclude('[data-dev-panel]')
      .analyze();
    const serious = violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });

  test('the sign-in screen fits a 360px phone', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto('ru/login');
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test('no horizontal scroll on a 360px phone', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  for (const path of ['ru', 'ru/catalog', 'ru/product/sakura-65', 'ru/checkout', 'ru/builder']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, path).toBeLessThanOrEqual(0);
  }
});

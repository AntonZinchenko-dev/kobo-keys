import { expect, test } from './fixtures';

test('filters live in the URL and survive a reload', async ({ page, isMobile }) => {
  await page.goto('en/catalog/keyboards');
  await expect(page.getByRole('heading', { level: 1, name: /Keyboards/ })).toBeVisible();

  if (isMobile) {
    await page.getByRole('button', { name: /Filters/ }).click();
    await page.getByText('Tactile').click();
    await page.getByRole('button', { name: /Show \d+ products?/ }).click();
  } else {
    await page.getByText('Tactile').click();
  }
  await expect(page).toHaveURL(/switch=tactile/);
  await page.reload();
  await expect(page.getByRole('button', { name: /Remove filter “Tactile”/ })).toBeVisible();
  await expect(page.getByRole('article')).toHaveCount(3);
});

test('a refresh on a deep link works (GitHub Pages 404.html fallback)', async ({ page }) => {
  await page.goto('pl/product/sakura-65?v=black/silk-linear');
  await expect(page.getByRole('heading', { level: 1, name: 'Sakura 65' })).toBeVisible();
  await expect(page.getByRole('group', { name: 'Kolor: Nocny' })).toBeVisible();
});

test('switching language and currency updates texts and prices', async ({ page, isMobile }) => {
  test.skip(isMobile, 'switchers live in the footer on phones; covered on desktop');
  await page.goto('ru/product/sakura-65');
  await expect(page.getByText('189 €').first()).toBeVisible();
  await page.getByLabel('Язык').first().selectOption('pl');
  await expect(page).toHaveURL(/\/pl\/product\/sakura-65/);
  await expect(page.getByRole('button', { name: 'Do koszyka' }).first()).toBeVisible();
  await expect(page.getByText(/807\szł/).first()).toBeVisible();
});

test('unknown pages show the 404 game', async ({ page }) => {
  await page.goto('en/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Kobo lost this page' })).toBeVisible();
});

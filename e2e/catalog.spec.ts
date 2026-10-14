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
  const language = page.getByRole('banner').getByRole('combobox', { name: 'Язык' });
  await language.click();
  await page.getByRole('option', { name: /Polski/ }).click();
  await expect(page).toHaveURL(/\/pl\/product\/sakura-65/);
  await expect(page.getByRole('button', { name: 'Do koszyka' }).first()).toBeVisible();
  await expect(page.getByText(/807\szł/).first()).toBeVisible();
});

test('unknown pages show the 404 game', async ({ page }) => {
  await page.goto('en/this-page-does-not-exist');
  await expect(page.getByRole('heading', { name: 'Kobo lost this page' })).toBeVisible();
});

test('like and compare buttons on a card do not open the product', async ({ page }) => {
  await page.goto('en/catalog/keyboards');
  const card = page.getByRole('article').filter({ hasText: 'Sakura 65' });
  await card.getByRole('button', { name: 'Add “Sakura 65” to wishlist' }).click();
  await card.getByRole('button', { name: 'Add “Sakura 65” to compare' }).click();
  await expect(page).toHaveURL(/\/en\/catalog\/keyboards$/);
  await expect(card.getByRole('button', { name: 'Remove “Sakura 65” from wishlist' })).toBeVisible();
  await expect(card.getByRole('button', { name: 'Remove “Sakura 65” from compare' })).toBeVisible();
  // …while the rest of the card still leads to the product
  await card.getByRole('heading', { name: 'Sakura 65' }).click();
  await expect(page).toHaveURL(/\/en\/product\/sakura-65/);
});

test('catalog sort uses the custom dropdown and keeps the choice in the URL', async ({ page }) => {
  await page.goto('en/catalog');
  const sort = page.getByRole('combobox', { name: /Sort/ });
  await sort.click();
  await expect(page.getByRole('listbox', { name: 'Sort by' })).toBeVisible();
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('listbox', { name: 'Sort by' })).toBeHidden();
  await expect(page).toHaveURL(/sort=/);
});

test('adding to the cart from a catalog card shows success, not an error', async ({ page }) => {
  await page.goto('ru/catalog/keyboards');
  await page.getByRole('article').first().getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByText('Добавлено в корзину')).toBeVisible();
  await expect(page.getByText('Что-то пошло не так')).toHaveCount(0);
  // …and the cart survives a reload (it is saved to localStorage)
  await page.reload();
  await page.goto('ru/cart');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('button', { name: /Удалить/ }).first()).toBeVisible();
});

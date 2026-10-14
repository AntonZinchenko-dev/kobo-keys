import { expect, test } from './fixtures';

test.describe('signed out', () => {
  test.use({ authenticated: false });

  test('the app starts with the sign-in screen and returns to the requested page', async ({ page }) => {
    await page.goto('ru/catalog/keyboards?switch=tactile');
    await expect(page).toHaveURL(/\/ru\/login\?returnTo=/);
    await expect(page.getByRole('heading', { level: 1, name: 'Вход в KŌBŌ' })).toBeVisible();
    // No shop chrome on the entry screen
    await expect(page.getByRole('navigation', { name: 'Основная навигация' })).toHaveCount(0);

    await page.getByLabel('Почта').fill('anna@example.com');
    await page.getByRole('button', { name: 'Получить код' }).click();
    await page.getByLabel('Код из письма').fill('123456');
    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await expect(page.getByText('Неверный код')).toBeVisible();

    await page.getByLabel('Код из письма').fill('000000');
    await page.getByRole('button', { name: 'Войти', exact: true }).click();
    await expect(page).toHaveURL(/\/ru\/catalog\/keyboards\?switch=tactile$/);
    await expect(page.getByRole('heading', { level: 1, name: /Клавиатуры/ })).toBeVisible();
  });

  test('the root URL opens the sign-in screen too', async ({ page }) => {
    await page.goto('');
    await expect(page).toHaveURL(/\/(ru|en|pl)\/login$/);
  });
});

test('signing out leads back to the sign-in screen', async ({ page }) => {
  await page.goto('en/account');
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/\/en\/login$/);
  await page.goto('en/catalog');
  await expect(page).toHaveURL(/\/en\/login\?returnTo=/);
});

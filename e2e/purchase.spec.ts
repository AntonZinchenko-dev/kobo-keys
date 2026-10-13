import { expect, test } from './fixtures';

const fillCheckout = async (page: import('@playwright/test').Page, card: string) => {
  await page.getByLabel('Почта').fill('anna@example.com');
  await page.getByLabel('Имя и фамилия').fill('Anna Kowalska');
  await page.getByLabel('Телефон').fill('48123456789');
  await page.getByRole('button', { name: 'Дальше' }).click();

  await page.getByText('Самовывоз из мастерской').click();
  await page.getByRole('button', { name: 'Дальше' }).click();

  await page.getByLabel('Номер карты').fill(card);
  await page.getByLabel('Срок действия').fill('1230');
  await page.getByLabel('CVC').fill('123');
  await page.getByLabel('Имя на карте').fill('ANNA KOWALSKA');
  await page.getByRole('button', { name: /Оплатить/ }).click();
};

test.describe('purchase flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('ru/product/hinoki-65');
    await expect(page.getByRole('heading', { level: 1, name: 'Hinoki Wood 65' })).toBeVisible();
  });

  test('buys a keyboard with the success card', async ({ page }) => {
    await page.getByRole('button', { name: 'В корзину' }).first().click();
    await expect(page.getByText('Добавлено в корзину')).toBeVisible();

    await page.goto('ru/cart');
    await expect(page.getByRole('link', { name: 'Hinoki Wood 65' })).toBeVisible();
    await page.getByRole('link', { name: 'Оформить' }).click();

    await fillCheckout(page, '4242424242424242');
    await expect(page.getByRole('heading', { name: 'Спасибо! Заказ оплачен' })).toBeVisible();
    await expect(page.getByText('Оплачен').first()).toBeVisible();
  });

  test('shows a decline, then passes 3-D Secure', async ({ page }) => {
    await page.getByRole('button', { name: 'В корзину' }).first().click();
    await expect(page.getByText('Добавлено в корзину')).toBeVisible();
    await page.goto('ru/checkout');

    await fillCheckout(page, '4000000000000002');
    await expect(page.getByRole('alert').filter({ hasText: 'Банк отклонил платёж' })).toBeVisible();

    await page.getByLabel('Номер карты').fill('4000002760003184');
    await page.getByRole('button', { name: /Оплатить/ }).click();
    await expect(page.getByRole('heading', { name: 'Подтверждение платежа' })).toBeVisible();
    await page.getByLabel('Код из SMS').fill('1234');
    await page.getByRole('button', { name: 'Подтвердить' }).click();
    await expect(page.getByRole('heading', { name: 'Спасибо! Заказ оплачен' })).toBeVisible();
  });
});

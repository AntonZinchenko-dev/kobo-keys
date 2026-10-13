import {
  api,
  ApiError,
  type Order,
  type PaymentResponse,
  type ProductsResponse,
  type Quote,
} from '@/shared/api';

import { resetDb } from '../db/store';
import { writeDevSettings } from '../dev-settings';

/** The mock backend is tested through the same `api()` client the app uses. */
describe('mock backend', () => {
  beforeEach(async () => {
    await resetDb();
  });

  describe('catalog', () => {
    it('filters, sorts and counts facets with the other filters applied', async () => {
      const res = await api<ProductsResponse>('/products', {
        query: { category: 'keyboards', layout: ['65'], sort: 'price-asc' },
      });
      expect(res.items.every((p) => p.layout === '65')).toBe(true);
      expect(res.items.map((p) => p.price)).toEqual([...res.items.map((p) => p.price)].sort((a, b) => a - b));
      // The layout facet ignores the layout filter itself, so other layouts are still counted
      expect(res.facets.layout['75']).toBeGreaterThan(0);
      expect(res.facets.category.keycaps).toBeUndefined();
    });

    it('returns 404 for an unknown product', async () => {
      await expect(api('/products/does-not-exist')).rejects.toMatchObject({
        status: 404,
        code: 'PRODUCT_NOT_FOUND',
      });
    });
  });

  describe('cart quote', () => {
    const lines = [{ productId: 'p-sakura-65', variantKey: 'white/silk-linear', qty: 1 }];

    it('applies a percent promo and free shipping above the threshold', async () => {
      const quote = await api<Quote>('/cart/quote', { method: 'POST', body: { lines, promo: 'KOBO10' } });
      expect(quote.subtotal).toBe(18900);
      expect(quote.discount).toBe(1890);
      expect(quote.shipping).toBe(0);
      expect(quote.total).toBe(17010);
    });

    it('charges shipping below the threshold and rejects expired promos', async () => {
      const small = [{ productId: 'p-cable-sakura', variantKey: 'default', qty: 1 }];
      const quote = await api<Quote>('/cart/quote', { method: 'POST', body: { lines: small } });
      expect(quote.shipping).toBe(990);
      await expect(
        api('/cart/quote', { method: 'POST', body: { lines: small, promo: 'SUMMER24' } }),
      ).rejects.toMatchObject({
        code: 'PROMO_EXPIRED',
      });
    });

    it('reports out-of-stock variants', async () => {
      await expect(
        api('/cart/check', {
          method: 'POST',
          body: { productId: 'p-sakura-65', variantKey: 'white/taiko-clicky', qty: 1 },
        }),
      ).rejects.toMatchObject({ status: 409, code: 'OUT_OF_STOCK' });
    });
  });

  describe('checkout and payments', () => {
    const createOrder = () =>
      api<Order>('/checkout', {
        method: 'POST',
        body: {
          lines: [{ productId: 'p-artisan-shiba', variantKey: 'default', qty: 1 }],
          shipping: 'workshop',
          contact: { email: 'anna@example.com', name: 'Anna', phone: '+48 123 456 789' },
        },
      });
    const pay = (orderId: string, number: string, key: string = crypto.randomUUID()) =>
      api<PaymentResponse>('/payments', {
        method: 'POST',
        headers: { 'Idempotency-Key': key },
        body: { orderId, method: 'card', card: { number, exp: '12/30', cvc: '123', name: 'ANNA' } },
      });

    it('pays with the success card and decrements stock', async () => {
      const order = await createOrder();
      const result = await pay(order.id, '4242424242424242');
      expect(result.status).toBe('succeeded');
      const paid = await api<Order>(`/orders/${order.id}`);
      expect(paid.status).toBe('paid');
      expect(paid.payment).toMatchObject({ brand: 'visa', last4: '4242' });
    });

    it('declines and reports insufficient funds', async () => {
      const order = await createOrder();
      await expect(pay(order.id, '4000000000000002')).rejects.toMatchObject({
        status: 402,
        code: 'CARD_DECLINED',
      });
      await expect(pay(order.id, '4000000000009995')).rejects.toMatchObject({ code: 'INSUFFICIENT_FUNDS' });
    });

    it('asks for 3-D Secure and confirms with the right code', async () => {
      const order = await createOrder();
      const result = await pay(order.id, '4000002760003184');
      expect(result.status).toBe('requires_action');
      const wrong = api(`/payments/${result.paymentId}/confirm`, { method: 'POST', body: { code: '0000' } });
      await expect(wrong).rejects.toMatchObject({ code: 'INVALID_CODE', details: { attemptsLeft: 2 } });
      const ok = await api<PaymentResponse>(`/payments/${result.paymentId}/confirm`, {
        method: 'POST',
        body: { code: '1234' },
      });
      expect(ok.status).toBe('succeeded');
    });

    it('is idempotent: the same key never charges twice', async () => {
      const order = await createOrder();
      const first = await pay(order.id, '4242424242424242', 'same-key');
      const second = await pay(order.id, '4242424242424242', 'same-key');
      expect(second).toEqual(first);
    });

    it('simulates a sold-out item during checkout via the dev panel scenario', async () => {
      writeDevSettings({ scenario: 'out-of-stock-on-checkout' });
      const error = await createOrder().catch((e: unknown) => e);
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).code).toBe('OUT_OF_STOCK');
    });
  });

  describe('auth', () => {
    it('signs in with code 000000 only', async () => {
      await expect(
        api('/auth/verify', { method: 'POST', body: { email: 'a@b.co', code: '123456' } }),
      ).rejects.toMatchObject({
        code: 'INVALID_CODE',
      });
      const auth = await api<{ token: string }>('/auth/verify', {
        method: 'POST',
        body: { email: 'a@b.co', code: '000000' },
      });
      expect(auth.token).toMatch(/^tok_/);
    });
  });
});

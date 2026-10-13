import { http, HttpResponse } from 'msw';

import type {
  CartLineInput,
  CheckoutRequest,
  Lang,
  Order,
  OrderStatus,
  PaymentRequest,
  PaymentResponse,
  Quote,
  QuoteRequest,
  ShippingMethod,
} from '@/shared/api/contracts';

import { ADDRESSES, FREE_SHIPPING_THRESHOLD, PROMOS, SHIPPING } from '../db/catalog';
import { type PricedLine, priceLine } from '../db/queries';
import { db, saveDb } from '../db/store';
import { readDevSettings } from '../dev-settings';
import { API, fail, langOf, uid } from './utils';

const stripSeed = ({ seed: _seed, ...line }: PricedLine) => line;

const resolvePromo = (code: string | undefined) => {
  if (!code) return { promo: undefined };
  const promo = PROMOS[code.trim().toUpperCase()];
  if (!promo) return { error: 'PROMO_NOT_FOUND' as const };
  if (promo.expired) return { error: 'PROMO_EXPIRED' as const };
  const { expired: _expired, ...rest } = promo;
  return { promo: rest };
};

export const buildQuote = (body: QuoteRequest, lang: Lang): Quote | { error: string } => {
  const priced = body.lines.map((l) => priceLine(l, lang)).filter((l): l is PricedLine => l !== null);
  const { promo, error } = resolvePromo(body.promo);
  if (error) return { error };
  const subtotal = priced.reduce((s, l) => s + l.total, 0);
  const discount = promo?.kind === 'percent' ? Math.round((subtotal * promo.value) / 100) : 0;
  const method: ShippingMethod = body.shipping ?? 'courier';
  const base = SHIPPING.find((s) => s.id === method)?.price ?? 0;
  const freeShipping = promo?.kind === 'free_shipping' || subtotal - discount >= FREE_SHIPPING_THRESHOLD;
  const shipping = priced.length === 0 || freeShipping ? 0 : base;
  return {
    lines: priced.map(stripSeed),
    subtotal,
    discount,
    shipping,
    total: subtotal - discount + shipping,
    ...(promo ? { promo } : {}),
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
  };
};

/** Order status moves forward on its own, so the timeline on the order page visibly "lives". */
const STATUS_STEPS: [OrderStatus, number][] = [
  ['paid', 0],
  ['processing', 30_000],
  ['shipped', 120_000],
  ['delivered', 300_000],
];

export const withLiveStatus = (order: Order): Order => {
  const paid = order.timeline.find((t) => t.status === 'paid');
  if (!paid || order.status === 'canceled') return order;
  const start = Date.parse(paid.at);
  const elapsed = Date.now() - start;
  const timeline = STATUS_STEPS.filter(([, offset]) => elapsed >= offset).map(([status, offset]) => ({
    status,
    at: new Date(start + offset).toISOString(),
  }));
  const created = order.timeline.slice(0, 1);
  return { ...order, status: timeline.at(-1)?.status ?? order.status, timeline: [...created, ...timeline] };
};

const brandOf = (number: string) =>
  /^4/.test(number)
    ? 'visa'
    : /^(5[1-5]|2[2-7])/.test(number)
      ? 'mastercard'
      : /^3[47]/.test(number)
        ? 'amex'
        : 'card';

const markPaid = (order: Order, payment: Order['payment']) => {
  order.status = 'paid';
  order.payment = payment;
  order.timeline.push({ status: 'paid', at: new Date().toISOString() });
  for (const line of order.lines) {
    const key = `${line.productId}::${line.variantKey}`;
    db.sold[key] = (db.sold[key] ?? 0) + line.qty;
  }
  saveDb();
};

const sessionEmail = (request: Request) => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  return token ? db.sessions[token] : undefined;
};

export const checkoutHandlers = [
  http.post(`${API}/cart/quote`, async ({ request }) => {
    const body = (await request.json()) as QuoteRequest;
    const quote = buildQuote(body, langOf(request));
    if ('error' in quote) return fail(422, quote.error);
    return HttpResponse.json(quote);
  }),

  http.post(`${API}/cart/promo`, async ({ request }) => {
    const { code } = (await request.json()) as { code: string };
    const { promo, error } = resolvePromo(code);
    if (error) return fail(422, error);
    return HttpResponse.json(promo);
  }),

  http.post(`${API}/cart/check`, async ({ request }) => {
    const line = (await request.json()) as CartLineInput;
    const priced = priceLine(line, langOf(request));
    if (!priced) return fail(404, 'PRODUCT_NOT_FOUND');
    if (priced.available < line.qty) return fail(409, 'OUT_OF_STOCK', { available: priced.available });
    return HttpResponse.json({ available: priced.available });
  }),

  http.get(`${API}/shipping/options`, () => HttpResponse.json(SHIPPING)),

  http.get(`${API}/address/suggest`, ({ request }) => {
    const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase();
    return HttpResponse.json(
      q.length < 2 ? [] : ADDRESSES.filter((a) => a.toLowerCase().includes(q)).slice(0, 5),
    );
  }),

  http.post(`${API}/checkout`, async ({ request }) => {
    const lang = langOf(request);
    const body = (await request.json()) as CheckoutRequest;
    if (body.lines.length === 0) return fail(422, 'CART_EMPTY');

    const quote = buildQuote(body, lang);
    if ('error' in quote) return fail(422, quote.error);

    const scenario = readDevSettings().scenario;
    const shortages = quote.lines
      .filter((l, i) => l.available < l.qty || (scenario === 'out-of-stock-on-checkout' && i === 0))
      .map((l) => ({
        key: l.key,
        name: l.name,
        available: scenario === 'out-of-stock-on-checkout' ? Math.max(0, l.qty - 1) : l.available,
      }));
    if (shortages.length) return fail(409, 'OUT_OF_STOCK', shortages);

    const now = new Date().toISOString();
    const order: Order = {
      id: uid('ord'),
      number: `KB-${String(1000 + db.orders.length + 1)}`,
      createdAt: now,
      status: 'pending_payment',
      lines: quote.lines,
      subtotal: quote.subtotal,
      discount: quote.discount,
      shippingPrice: quote.shipping,
      total: quote.total,
      shipping: body.shipping,
      contact: body.contact,
      ...(body.address ? { address: body.address } : {}),
      timeline: [{ status: 'pending_payment', at: now }],
    };
    db.orders.unshift(order);
    const email = sessionEmail(request);
    if (email && db.users[email] && body.address) {
      const user = db.users[email];
      const known = user.addresses.some(
        (a) => a.street === body.address?.street && a.city === body.address.city,
      );
      if (!known) user.addresses.push(body.address);
    }
    saveDb();
    return HttpResponse.json(order, { status: 201 });
  }),

  http.post(`${API}/payments`, async ({ request }) => {
    // Idempotency: the same key always gets the same answer — a double click never charges twice.
    const key = request.headers.get('Idempotency-Key');
    const cached = key ? db.idempotency[key] : undefined;
    if (cached) return HttpResponse.json(cached.body as object, { status: cached.status });

    const remember = (status: number, body: object) => {
      if (key) {
        db.idempotency[key] = { status, body };
        saveDb();
      }
      return HttpResponse.json(body, { status });
    };

    if (readDevSettings().scenario === 'payment-server-down') return fail(502, 'PAYMENT_GATEWAY_DOWN');

    const body = (await request.json()) as PaymentRequest;
    const order = db.orders.find((o) => o.id === body.orderId);
    if (!order) return fail(404, 'ORDER_NOT_FOUND');
    if (order.status !== 'pending_payment') return fail(409, 'ALREADY_PAID');

    if (body.method !== 'card') {
      markPaid(order, { method: body.method });
      return remember(200, {
        status: 'succeeded',
        paymentId: uid('pay'),
        orderId: order.id,
      } satisfies PaymentResponse);
    }

    const number = (body.card?.number ?? '').replace(/\D/g, '');
    const payment = { method: 'card' as const, brand: brandOf(number), last4: number.slice(-4) };
    switch (number) {
      case '4000000000000002':
        return remember(402, { code: 'CARD_DECLINED' });
      case '4000000000009995':
        return remember(402, { code: 'INSUFFICIENT_FUNDS' });
      case '4000002760003184': {
        const paymentId = uid('pay');
        db.pendingPayments[paymentId] = {
          orderId: order.id,
          attempts: 0,
          brand: payment.brand,
          last4: payment.last4,
        };
        return remember(200, {
          status: 'requires_action',
          paymentId,
          orderId: order.id,
        } satisfies PaymentResponse);
      }
      default:
        markPaid(order, payment);
        return remember(200, {
          status: 'succeeded',
          paymentId: uid('pay'),
          orderId: order.id,
        } satisfies PaymentResponse);
    }
  }),

  http.get(`${API}/payments/:id`, ({ params }) => {
    const pending = db.pendingPayments[String(params.id)];
    if (!pending) return fail(404, 'PAYMENT_NOT_FOUND');
    const order = db.orders.find((o) => o.id === pending.orderId);
    return HttpResponse.json({ orderId: pending.orderId, total: order?.total ?? 0, last4: pending.last4 });
  }),

  http.post(`${API}/payments/:id/confirm`, async ({ params, request }) => {
    const id = String(params.id);
    const pending = db.pendingPayments[id];
    if (!pending) return fail(404, 'PAYMENT_NOT_FOUND');
    const { code } = (await request.json()) as { code: string };
    if (code !== '1234') {
      pending.attempts += 1;
      saveDb();
      if (pending.attempts >= 3) {
        delete db.pendingPayments[id];
        saveDb();
        return fail(402, 'AUTH_FAILED');
      }
      return fail(422, 'INVALID_CODE', { attemptsLeft: 3 - pending.attempts });
    }
    const order = db.orders.find((o) => o.id === pending.orderId);
    if (!order) return fail(404, 'ORDER_NOT_FOUND');
    markPaid(order, { method: 'card', brand: pending.brand, last4: pending.last4 });
    delete db.pendingPayments[id];
    saveDb();
    return HttpResponse.json({
      status: 'succeeded',
      paymentId: id,
      orderId: order.id,
    } satisfies PaymentResponse);
  }),

  http.get(`${API}/orders/:id`, ({ params }) => {
    const order = db.orders.find((o) => o.id === params.id || o.number === params.id);
    if (!order) return fail(404, 'ORDER_NOT_FOUND');
    return HttpResponse.json(withLiveStatus(order));
  }),

  http.get(`${API}/orders`, ({ request }) => {
    const email = sessionEmail(request);
    if (!email) return fail(401, 'UNAUTHORIZED');
    return HttpResponse.json(db.orders.filter((o) => o.contact.email === email).map(withLiveStatus));
  }),
];

import { http, HttpResponse } from 'msw';

import type { Address, AuthResponse, Subscription, SubscriptionAction, User } from '@/shared/api/contracts';

import { plans } from '../db/catalog';
import { db, resetDb, saveDb } from '../db/store';
import { API, fail, langOf, uid } from './utils';

const DAY = 86_400_000;
const addMonths = (date: Date, months: number) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
};

const currentUser = (request: Request): User | undefined => {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '');
  const email = token ? db.sessions[token] : undefined;
  return email ? db.users[email] : undefined;
};

export const accountHandlers = [
  http.post(`${API}/auth/login`, async ({ request }) => {
    const { email } = (await request.json()) as { email: string };
    if (!/^\S+@\S+\.\S+$/.test(email)) return fail(422, 'INVALID_EMAIL');
    return new HttpResponse(null, { status: 204 });
  }),

  http.post(`${API}/auth/verify`, async ({ request }) => {
    const { email, code } = (await request.json()) as { email: string; code: string };
    if (code !== '000000') return fail(422, 'INVALID_CODE');
    const key = email.toLowerCase();
    db.users[key] ??= {
      id: uid('usr'),
      email: key,
      name: key.split('@')[0] ?? 'Guest',
      addresses: [],
    };
    const token = uid('tok');
    db.sessions[token] = key;
    saveDb();
    return HttpResponse.json({ token, user: db.users[key] } satisfies AuthResponse);
  }),

  http.post(`${API}/auth/logout`, ({ request }) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (token) delete db.sessions[token];
    saveDb();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${API}/me`, ({ request }) => {
    const user = currentUser(request);
    return user ? HttpResponse.json(user) : fail(401, 'UNAUTHORIZED');
  }),

  http.patch(`${API}/me`, async ({ request }) => {
    const user = currentUser(request);
    if (!user) return fail(401, 'UNAUTHORIZED');
    const patch = (await request.json()) as Partial<Pick<User, 'name'>> & { addresses?: Address[] };
    Object.assign(user, patch);
    saveDb();
    return HttpResponse.json(user);
  }),

  http.get(`${API}/subscription/plans`, ({ request }) => HttpResponse.json(plans(langOf(request)))),

  http.get(`${API}/subscription`, ({ request }) => {
    const user = currentUser(request);
    if (!user) return fail(401, 'UNAUTHORIZED');
    return HttpResponse.json(db.subscriptions[user.email] ?? null);
  }),

  http.post(`${API}/subscription`, async ({ request }) => {
    const user = currentUser(request);
    if (!user) return fail(401, 'UNAUTHORIZED');
    const { plan, period } = (await request.json()) as Pick<Subscription, 'plan' | 'period'>;
    const price = plans('en').find((p) => p.id === plan);
    if (!price) return fail(422, 'PLAN_NOT_FOUND');
    const now = new Date();
    const sub: Subscription = {
      plan,
      period,
      status: 'active',
      startedAt: now.toISOString(),
      nextBillingAt: addMonths(now, period === 'year' ? 12 : 1),
      pausedUntil: null,
      history: [
        { date: now.toISOString(), amount: period === 'year' ? price.yearly : price.monthly, status: 'paid' },
      ],
    };
    db.subscriptions[user.email] = sub;
    saveDb();
    return HttpResponse.json(sub, { status: 201 });
  }),

  http.patch(`${API}/subscription`, async ({ request }) => {
    const user = currentUser(request);
    if (!user) return fail(401, 'UNAUTHORIZED');
    const sub = db.subscriptions[user.email];
    if (!sub) return fail(404, 'NO_SUBSCRIPTION');
    const action = (await request.json()) as SubscriptionAction;
    const now = new Date();
    switch (action.type) {
      case 'change':
        sub.plan = action.plan;
        sub.period = action.period;
        sub.status = 'active';
        break;
      case 'pause':
        sub.status = 'paused';
        sub.pausedUntil = addMonths(now, action.months);
        sub.nextBillingAt = sub.pausedUntil;
        break;
      case 'resume':
        sub.status = 'active';
        sub.pausedUntil = null;
        sub.nextBillingAt = new Date(now.getTime() + 30 * DAY).toISOString();
        break;
      case 'cancel':
        sub.status = 'canceled';
        sub.nextBillingAt = null;
        sub.pausedUntil = null;
        break;
    }
    saveDb();
    return HttpResponse.json(sub);
  }),

  /** Used by the developer panel: wipes orders, users and stock changes. */
  http.post(`${API}/__reset`, async () => {
    await resetDb();
    return new HttpResponse(null, { status: 204 });
  }),
];

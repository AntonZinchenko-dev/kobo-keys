import { del, get, set } from 'idb-keyval';

import type { Order, Subscription, User } from '@/shared/api/contracts';

/**
 * Mutable "database" of the mock backend.
 * In the browser it is persisted to IndexedDB, so orders survive reloads on GitHub Pages.
 * In tests (no IndexedDB) it simply lives in memory.
 */
export interface MockDb {
  orders: Order[];
  /** Units sold per "productId::variantKey" — subtracted from seed stock */
  sold: Record<string, number>;
  users: Record<string, User>;
  /** token → email */
  sessions: Record<string, string>;
  /** email → subscription */
  subscriptions: Record<string, Subscription>;
  /** Idempotency-Key → serialized response */
  idempotency: Record<string, { status: number; body: unknown }>;
  /** paymentId → pending 3-D Secure payment */
  pendingPayments: Record<string, { orderId: string; attempts: number; brand: string; last4: string }>;
  helpful: Record<string, number>;
}

const KEY = 'kobo-keys-db-v1';
const hasIdb = typeof indexedDB !== 'undefined';

export const emptyDb = (): MockDb => ({
  orders: [],
  sold: {},
  users: {},
  sessions: {},
  subscriptions: {},
  idempotency: {},
  pendingPayments: {},
  helpful: {},
});

export let db: MockDb = emptyDb();

export const loadDb = async () => {
  if (!hasIdb) return;
  try {
    const saved = await get<MockDb>(KEY);
    if (saved) db = { ...emptyDb(), ...saved };
  } catch {
    // Private mode or blocked storage: keep the in-memory db
  }
};

export const saveDb = () => {
  if (!hasIdb) return;
  void set(KEY, db).catch(() => undefined);
};

export const resetDb = async () => {
  db = emptyDb();
  if (hasIdb) await del(KEY).catch(() => undefined);
};

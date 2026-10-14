import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { CartLineInput, ShippingMethod } from '@/shared/api';

/** What we already know about a line, so the cart renders instantly before the server quote arrives. */
export interface CartLineSnapshot {
  name: string;
  slug?: string | undefined;
  image?: string | undefined;
  unitPrice: number;
  variantLabel: string;
}

export interface CartLine extends CartLineInput {
  key: string;
  snapshot: CartLineSnapshot;
  addedAt: number;
}

interface CartState {
  lines: CartLine[];
  promo: string | null;
  shipping: ShippingMethod;
  add: (line: CartLineInput, snapshot: CartLineSnapshot) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  restore: (lines: CartLine[]) => void;
  clear: () => void;
  setPromo: (code: string | null) => void;
  setShipping: (method: ShippingMethod) => void;
}

export const lineKey = (productId: string, variantKey: string) => `${productId}::${variantKey}`;
export const CART_STORAGE_KEY = 'kobo-cart';
const MAX_QTY = 20;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      promo: null,
      shipping: 'courier',
      add: ({ productId, variantKey, qty }, snapshot) => {
        // Only plain fields go into the line: callers may pass extra things (e.g. a DOM node for the
        // fly-to-cart animation), and the whole cart is persisted to localStorage as JSON.
        const input = { productId, variantKey, qty };
        const key = lineKey(productId, variantKey);
        const existing = get().lines.find((l) => l.key === key);
        set({
          lines: existing
            ? get().lines.map((l) =>
                l.key === key ? { ...l, qty: Math.min(MAX_QTY, l.qty + input.qty), snapshot } : l,
              )
            : [...get().lines, { ...input, key, snapshot, addedAt: Date.now() }],
        });
      },
      setQty: (key, qty) =>
        set({
          lines: get().lines.map((l) =>
            l.key === key ? { ...l, qty: Math.max(1, Math.min(MAX_QTY, qty)) } : l,
          ),
        }),
      remove: (key) => set({ lines: get().lines.filter((l) => l.key !== key) }),
      restore: (lines) => set({ lines }),
      clear: () => set({ lines: [], promo: null }),
      setPromo: (promo) => set({ promo }),
      setShipping: (shipping) => set({ shipping }),
    }),
    { name: CART_STORAGE_KEY, storage: createJSONStorage(() => localStorage), version: 1 },
  ),
);

/** The same cart in every open tab: another tab writes localStorage → we re-read it. */
export const syncCartAcrossTabs = () => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === CART_STORAGE_KEY) void useCartStore.persist.rehydrate();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
};

export const selectCount = (s: CartState) => s.lines.reduce((sum, l) => sum + l.qty, 0);
export const toLineInputs = (lines: CartLine[]): CartLineInput[] =>
  lines.map(({ productId, variantKey, qty }) => ({ productId, variantKey, qty }));

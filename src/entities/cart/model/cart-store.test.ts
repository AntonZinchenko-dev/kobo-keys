import { lineKey, selectCount, useCartStore } from './cart-store';

const snapshot = { name: 'Sakura 65', unitPrice: 18900, variantLabel: 'Milk · Silk Linear' };

describe('cart store', () => {
  beforeEach(() => useCartStore.getState().clear());

  it('merges the same variant into one line and caps the quantity', () => {
    const { add } = useCartStore.getState();
    add({ productId: 'p-sakura-65', variantKey: 'white/silk-linear', qty: 2 }, snapshot);
    add({ productId: 'p-sakura-65', variantKey: 'white/silk-linear', qty: 30 }, snapshot);
    add({ productId: 'p-sakura-65', variantKey: 'black/silk-linear', qty: 1 }, snapshot);
    const state = useCartStore.getState();
    expect(state.lines).toHaveLength(2);
    expect(state.lines[0]?.qty).toBe(20);
    expect(selectCount(state)).toBe(21);
  });

  it('keeps quantity at least 1 and removes lines', () => {
    const { add, setQty, remove } = useCartStore.getState();
    add({ productId: 'p-cable-sakura', variantKey: 'default', qty: 1 }, snapshot);
    const key = lineKey('p-cable-sakura', 'default');
    setQty(key, 0);
    expect(useCartStore.getState().lines[0]?.qty).toBe(1);
    remove(key);
    expect(useCartStore.getState().lines).toHaveLength(0);
  });

  it('stores only plain data, so the cart can always be saved to localStorage', () => {
    // A product card passes its DOM node along for the fly-to-cart animation
    const input = {
      productId: 'p-sakura-65',
      variantKey: 'white/silk-linear',
      qty: 1,
      source: document.createElement('article'),
    };
    expect(() => useCartStore.getState().add(input, snapshot)).not.toThrow();
    expect(useCartStore.getState().lines[0]).not.toHaveProperty('source');
    expect(localStorage.getItem('kobo-cart')).toContain('white/silk-linear');
  });
});

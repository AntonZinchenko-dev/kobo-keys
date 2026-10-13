import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface WishlistState {
  slugs: string[];
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) =>
        set({
          slugs: get().slugs.includes(slug) ? get().slugs.filter((s) => s !== slug) : [slug, ...get().slugs],
        }),
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
    }),
    { name: 'kobo-wishlist' },
  ),
);

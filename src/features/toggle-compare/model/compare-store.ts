import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const COMPARE_LIMIT = 4;

interface CompareState {
  slugs: string[];
  /** Returns false when the list is full */
  toggle: (slug: string) => boolean;
  remove: (slug: string) => void;
  clear: () => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: (slug) => {
        const { slugs } = get();
        if (slugs.includes(slug)) {
          set({ slugs: slugs.filter((s) => s !== slug) });
          return true;
        }
        if (slugs.length >= COMPARE_LIMIT) return false;
        set({ slugs: [...slugs, slug] });
        return true;
      },
      remove: (slug) => set({ slugs: get().slugs.filter((s) => s !== slug) }),
      clear: () => set({ slugs: [] }),
    }),
    { name: 'kobo-compare' },
  ),
);

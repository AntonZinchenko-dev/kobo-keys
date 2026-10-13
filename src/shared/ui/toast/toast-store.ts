import { create } from 'zustand';

export type Tone = 'info' | 'success' | 'error';

export interface ToastItem {
  id: number;
  tone: Tone;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  items: ToastItem[];
  push: (toast: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (toast) => {
    const id = nextId++;
    set({ items: [...get().items.slice(-3), { ...toast, id }] });
    window.setTimeout(() => get().dismiss(id), toast.action ? 7000 : 4500);
  },
  dismiss: (id) => set({ items: get().items.filter((t) => t.id !== id) }),
}));

/** Imperative API usable from mutations: toast.success('Added to cart') */
export const toast = {
  info: (title: string, extra?: Partial<Omit<ToastItem, 'id' | 'tone' | 'title'>>) =>
    useToastStore.getState().push({ tone: 'info', title, ...extra }),
  success: (title: string, extra?: Partial<Omit<ToastItem, 'id' | 'tone' | 'title'>>) =>
    useToastStore.getState().push({ tone: 'success', title, ...extra }),
  error: (title: string, extra?: Partial<Omit<ToastItem, 'id' | 'tone' | 'title'>>) =>
    useToastStore.getState().push({ tone: 'error', title, ...extra }),
};

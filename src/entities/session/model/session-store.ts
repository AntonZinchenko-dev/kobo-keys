import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { setApiToken, type User } from '@/shared/api';

interface SessionState {
  token: string | null;
  user: User | null;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setSession: (token, user) => {
        setApiToken(token);
        set({ token, user });
      },
      setUser: (user) => set({ user }),
      clear: () => {
        setApiToken(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: 'kobo-session',
      onRehydrateStorage: () => (state) => setApiToken(state?.token ?? null),
    },
  ),
);

export const useIsAuthorized = () => useSessionStore((s) => s.token !== null);

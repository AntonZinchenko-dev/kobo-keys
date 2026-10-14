import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { setApiToken, type User } from '@/shared/api';

interface SessionState {
  token: string | null;
  user: User | null;
  /** The user pressed "Sign out" in this tab (not persisted): the sign-in screen opens without a return path */
  signedOut: boolean;
  setSession: (token: string, user: User) => void;
  setUser: (user: User) => void;
  /** Manual sign-out */
  clear: () => void;
  /** The server no longer knows the token (401) */
  expire: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      signedOut: false,
      setSession: (token, user) => {
        setApiToken(token);
        set({ token, user, signedOut: false });
      },
      setUser: (user) => set({ user }),
      clear: () => {
        setApiToken(null);
        set({ token: null, user: null, signedOut: true });
      },
      expire: () => {
        setApiToken(null);
        set({ token: null, user: null });
      },
    }),
    {
      name: 'kobo-session',
      partialize: ({ token, user }) => ({ token, user }),
      onRehydrateStorage: () => (state) => setApiToken(state?.token ?? null),
    },
  ),
);

export const useIsAuthorized = () => useSessionStore((s) => s.token !== null);

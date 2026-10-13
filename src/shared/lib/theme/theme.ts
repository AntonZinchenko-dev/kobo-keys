import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemePreference = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
}

/** Applies the theme to <html>; CSS tokens switch via light-dark() + color-scheme. */
export const applyTheme = (theme: ThemePreference) => {
  const root = document.documentElement;
  if (theme === 'system') root.removeAttribute('data-theme');
  else root.dataset.theme = theme;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'dark',
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
    }),
    { name: 'kobo-theme', onRehydrateStorage: () => (state) => applyTheme(state?.theme ?? 'dark') },
  ),
);

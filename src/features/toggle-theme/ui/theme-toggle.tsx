import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { type ThemePreference, useThemeStore, withViewTransition } from '@/shared/lib';
import { IconButton, type IconName } from '@/shared/ui';

const NEXT: Record<ThemePreference, ThemePreference> = { dark: 'light', light: 'system', system: 'dark' };
const ICON: Record<ThemePreference, IconName> = { dark: 'moon', light: 'sun', system: 'monitor' };

/** Cycles dark → light → system; the new theme spreads as a circle from the button (View Transitions). */
export const ThemeToggle = () => {
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);

  const onClick = (e: MouseEvent<HTMLButtonElement>) => {
    const root = document.documentElement;
    root.style.setProperty('--reveal-x', `${e.clientX}px`);
    root.style.setProperty('--reveal-y', `${e.clientY}px`);
    root.dataset.themeSwitching = '';
    const transition = withViewTransition(() => setTheme(NEXT[theme]));
    const done = () => delete root.dataset.themeSwitching;
    if (transition) void transition.finished.finally(done);
    else done();
  };

  return (
    <IconButton
      icon={ICON[theme]}
      label={t('settings.theme', { theme: t(`settings.themes.${theme}`) })}
      onClick={onClick}
    />
  );
};

import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, ScrollRestoration, useLocation, useParams } from 'react-router';

import { DevPanel } from '@/widgets/dev-panel';
import { useSessionStore } from '@/entities/session';
import { LANGS, queryClient, setApiLanguage, setUnauthorizedHandler } from '@/shared/api';
import { detectLang, i18n, isLang, LANG_STORAGE_KEY } from '@/shared/i18n';
import { Toaster } from '@/shared/ui';

import { PageFallback } from './page-fallback';

const SITE = 'https://antonzinchenko-dev.github.io';

/**
 * Root of /:lang/* — keeps i18n, API language and <html lang> in sync with the URL.
 * Holds what both the sign-in screen and the shop need: toasts, the dev panel, scroll restoration.
 */
export const LangLayout = () => {
  const { lang } = useParams();
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLang(lang)) return;
    setApiLanguage(lang);
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore
    }
  }, [lang]);

  // A 401 from the backend means the session is gone: drop it, the auth gate shows the sign-in screen
  useEffect(() => {
    setUnauthorizedHandler(() => {
      useSessionStore.getState().expire();
      queryClient.removeQueries({ queryKey: ['me'] });
      queryClient.removeQueries({ queryKey: ['orders'] });
      queryClient.removeQueries({ queryKey: ['subscription'] });
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  if (!isLang(lang)) {
    return <Navigate to={`/${detectLang()}${location.pathname}${location.search}`} replace />;
  }
  setApiLanguage(lang);

  const rest = location.pathname.replace(/^\/[a-z]{2}/, '');
  const base = `${SITE}${import.meta.env.BASE_URL.replace(/\/$/, '')}`;

  return (
    <>
      {LANGS.map((l) => (
        <link key={l} rel="alternate" hrefLang={l} href={`${base}/${l}${rest}`} />
      ))}
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
      <DevPanel />
      <Toaster closeLabel={t('actions.close')} />
      <ScrollRestoration />
    </>
  );
};

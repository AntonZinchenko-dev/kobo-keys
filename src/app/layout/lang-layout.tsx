import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, ScrollRestoration, useLocation, useParams } from 'react-router';

import { BottomNav } from '@/widgets/bottom-nav';
import { DevPanel } from '@/widgets/dev-panel';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { MiniCart } from '@/widgets/mini-cart';
import { SearchDialog } from '@/widgets/search-dialog';
import { syncCartAcrossTabs } from '@/entities/cart';
import { LANGS, setApiLanguage } from '@/shared/api';
import { detectLang, i18n, isLang, LANG_STORAGE_KEY } from '@/shared/i18n';
import { Toaster } from '@/shared/ui';

import { OfflineBanner } from './offline-banner';
import { PageFallback } from './page-fallback';

const SITE = 'https://antonzinchenko-dev.github.io';

/** Root layout for /:lang/* — keeps i18n, API language and <html lang> in sync with the URL. */
export const LangLayout = () => {
  const { lang } = useParams();
  const location = useLocation();
  const { t } = useTranslation();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  useEffect(syncCartAcrossTabs, []);

  // Ctrl/⌘ + K opens search from anywhere
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close overlays on navigation
  useEffect(() => {
    setCartOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

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
      <a className="skip-link" href="#main">
        {t('nav.skip')}
      </a>
      <Header onOpenCart={() => setCartOpen(true)} onOpenSearch={() => setSearchOpen(true)} />
      <OfflineBanner />
      <main id="main" tabIndex={-1} style={{ flex: 1 }}>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <BottomNav onOpenSearch={() => setSearchOpen(true)} />
      <MiniCart open={cartOpen} onClose={() => setCartOpen(false)} />
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      <DevPanel />
      <Toaster closeLabel={t('actions.close')} />
      <ScrollRestoration />
    </>
  );
};

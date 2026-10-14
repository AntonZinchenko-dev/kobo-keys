import { Suspense, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router';

import { BottomNav } from '@/widgets/bottom-nav';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';
import { MiniCart } from '@/widgets/mini-cart';
import { SearchDialog } from '@/widgets/search-dialog';
import { syncCartAcrossTabs } from '@/entities/cart';
import { useSessionStore } from '@/entities/session';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';

import { OfflineBanner } from './offline-banner';
import { PageFallback } from './page-fallback';

/** The shop itself — only for signed-in visitors; everyone else lands on the sign-in screen first. */
export const AppShell = () => {
  const lang = useLang();
  const location = useLocation();
  const authorized = useSessionStore((s) => s.token !== null);
  const signedOut = useSessionStore((s) => s.signedOut);

  if (!authorized) {
    // After a manual sign-out there is nothing to return to; otherwise come back to the requested page
    const target = `${location.pathname}${location.search}`;
    const home = target === paths.home(lang) || target === `${paths.home(lang)}/`;
    return <Navigate to={paths.login(lang, signedOut || home ? undefined : target)} replace />;
  }
  return <Shell />;
};

const Shell = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

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

  return (
    <>
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
    </>
  );
};

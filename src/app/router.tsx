import { createBrowserRouter, Navigate } from 'react-router';

import { detectLang } from '@/shared/i18n';

import { LangLayout } from './layout/lang-layout';
import { PageFallback } from './layout/page-fallback';
import { RouteError } from './layout/route-error';

/** Every page is its own chunk; React Router loads it on navigation. */
export const router = createBrowserRouter(
  [
    { path: '/', element: <Navigate to={`/${detectLang()}`} replace /> },
    {
      path: '/:lang',
      element: <LangLayout />,
      errorElement: <RouteError />,
      hydrateFallbackElement: <PageFallback />,
      children: [
        { index: true, lazy: async () => ({ Component: (await import('@/pages/home')).HomePage }) },
        {
          path: 'catalog/:category?',
          lazy: async () => ({ Component: (await import('@/pages/catalog')).CatalogPage }),
        },
        {
          path: 'product/:slug',
          lazy: async () => ({ Component: (await import('@/pages/product')).ProductPage }),
        },
        { path: 'builder', lazy: async () => ({ Component: (await import('@/pages/builder')).BuilderPage }) },
        { path: 'club', lazy: async () => ({ Component: (await import('@/pages/club')).ClubPage }) },
        { path: 'cart', lazy: async () => ({ Component: (await import('@/pages/cart')).CartPage }) },
        {
          path: 'checkout',
          lazy: async () => ({ Component: (await import('@/pages/checkout')).CheckoutPage }),
        },
        {
          path: 'checkout/3ds',
          lazy: async () => ({ Component: (await import('@/pages/three-ds')).ThreeDsPage }),
        },
        { path: 'order/:id', lazy: async () => ({ Component: (await import('@/pages/order')).OrderPage }) },
        { path: 'account', lazy: async () => ({ Component: (await import('@/pages/account')).AccountPage }) },
        { path: 'login', lazy: async () => ({ Component: (await import('@/pages/login')).LoginPage }) },
        {
          path: 'wishlist',
          lazy: async () => ({ Component: (await import('@/pages/wishlist')).WishlistPage }),
        },
        { path: 'compare', lazy: async () => ({ Component: (await import('@/pages/compare')).ComparePage }) },
        { path: '*', lazy: async () => ({ Component: (await import('@/pages/not-found')).NotFoundPage }) },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL.replace(/\/$/, '') || '/' },
);

import type { ReactElement } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

import type { Lang } from '@/shared/api';
import { i18n, initI18n, NAMESPACES } from '@/shared/i18n';

let ready: Promise<unknown> | null = null;

/** Real translations (all namespaces), a fresh QueryClient and a router at /<lang>/… */
export const renderWithProviders = async (
  ui: ReactElement,
  { lang = 'ru', path = '' }: { lang?: Lang; path?: string } = {},
) => {
  ready ??= initI18n(lang);
  await ready;
  await i18n.changeLanguage(lang);
  await i18n.loadNamespaces([...NAMESPACES]);
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const router = createMemoryRouter([{ path: '/:lang/*', element: ui }], {
    initialEntries: [`/${lang}/${path}`],
  });
  return render(
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </I18nextProvider>,
  );
};

import { I18nextProvider } from 'react-i18next';
import { RouterProvider } from 'react-router/dom';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/shared/api';
import { i18n } from '@/shared/i18n';

import { router } from './router';

export const App = () => (
  <I18nextProvider i18n={i18n}>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </I18nextProvider>
);

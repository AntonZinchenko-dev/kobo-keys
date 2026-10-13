import { QueryClient } from '@tanstack/react-query';

import { isApiError } from './client';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Retry only what can be fixed by retrying: network errors and 5xx, not 4xx.
      retry: (failureCount, error) =>
        failureCount < 2 && (!isApiError(error) || error.status === 0 || error.status >= 500),
    },
    mutations: { retry: false },
  },
});

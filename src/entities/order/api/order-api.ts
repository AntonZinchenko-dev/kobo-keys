import { queryOptions } from '@tanstack/react-query';

import { api, type Order } from '@/shared/api';

export const orderQuery = (id: string) =>
  queryOptions({
    queryKey: ['orders', id],
    queryFn: ({ signal }) => api<Order>(`/orders/${id}`, { signal }),
    // The mock backend moves the status forward over time — poll to show it live.
    refetchInterval: (query) => (query.state.data?.status === 'delivered' ? false : 15_000),
  });

export const ordersQuery = (token: string | null) =>
  queryOptions({
    queryKey: ['orders', 'mine', token],
    queryFn: ({ signal }) => api<Order[]>('/orders', { signal }),
    enabled: token !== null,
  });

import { keepPreviousData, queryOptions } from '@tanstack/react-query';

import {
  api,
  type CartLineInput,
  type Lang,
  type Promo,
  type Quote,
  type ShippingMethod,
  type ShippingOption,
  type StockCheckResponse,
} from '@/shared/api';

/** Totals are always computed by the server — the client never trusts its own maths for money. */
export const quoteQuery = (
  lang: Lang,
  lines: CartLineInput[],
  promo: string | null,
  shipping: ShippingMethod,
) =>
  queryOptions({
    queryKey: ['cart', 'quote', lang, lines, promo, shipping] as const,
    queryFn: ({ signal }) =>
      api<Quote>('/cart/quote', {
        method: 'POST',
        body: { lines, ...(promo ? { promo } : {}), shipping },
        signal,
      }),
    placeholderData: keepPreviousData,
    enabled: lines.length > 0,
    staleTime: 10_000,
  });

export const shippingOptionsQuery = queryOptions({
  queryKey: ['shipping', 'options'],
  queryFn: ({ signal }) => api<ShippingOption[]>('/shipping/options', { signal }),
  staleTime: Infinity,
});

export const checkStock = (line: CartLineInput) =>
  api<StockCheckResponse>('/cart/check', { method: 'POST', body: line });

export const validatePromo = (code: string) => api<Promo>('/cart/promo', { method: 'POST', body: { code } });

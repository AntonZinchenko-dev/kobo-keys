import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useLang } from '@/shared/i18n';

import { quoteQuery } from '../api/cart-api';
import { toLineInputs, useCartStore } from './cart-store';

/** Cart lines from the local store + authoritative totals from the server. */
export const useCartQuote = () => {
  const lang = useLang();
  const lines = useCartStore((s) => s.lines);
  const promo = useCartStore((s) => s.promo);
  const shipping = useCartStore((s) => s.shipping);
  const inputs = useMemo(() => toLineInputs(lines), [lines]);
  const quote = useQuery(quoteQuery(lang, inputs, promo, shipping));
  const byKey = useMemo(() => new Map(quote.data?.lines.map((l) => [l.key, l])), [quote.data]);
  return { lines, quote, byKey, promo, shipping };
};

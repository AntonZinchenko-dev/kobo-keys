import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { api } from '@/shared/api/client';
import { CURRENCIES, type Currency, type Lang, type Rates } from '@/shared/api/contracts';
import { INTL_LOCALE, useLang } from '@/shared/i18n';

/** Default currency per language on the first visit; the user can change it any time. */
const DEFAULT_CURRENCY: Record<Lang, Currency> = { ru: 'EUR', en: 'EUR', pl: 'PLN' };

interface CurrencyState {
  currency: Currency | null;
  setCurrency: (currency: Currency) => void;
}

export const useCurrencyStore = create<CurrencyState>()(
  persist((set) => ({ currency: null, setCurrency: (currency) => set({ currency }) }), {
    name: 'kobo-currency',
  }),
);

export const FALLBACK_RATES: Rates = { base: 'EUR', rates: { EUR: 1, PLN: 4.27, USD: 1.09 }, updatedAt: '' };

export const ratesQueryOptions = {
  queryKey: ['rates'],
  queryFn: ({ signal }: { signal: AbortSignal }) => api<Rates>('/rates', { signal }),
  staleTime: 60 * 60 * 1000,
} as const;

/** Converts cents in EUR to the target currency, rounded to whole units like real shops do. */
export const convert = (cents: number, currency: Currency, rates: Rates) =>
  currency === 'EUR' ? cents : Math.round((cents * rates.rates[currency]) / 100) * 100;

export const formatMoney = (cents: number, currency: Currency, lang: Lang, rates: Rates = FALLBACK_RATES) =>
  new Intl.NumberFormat(INTL_LOCALE[lang], {
    style: 'currency',
    currency,
    trailingZeroDisplay: 'stripIfInteger',
  }).format(convert(cents, currency, rates) / 100);

export const useCurrency = (): Currency => {
  const lang = useLang();
  const chosen = useCurrencyStore((s) => s.currency);
  return chosen ?? DEFAULT_CURRENCY[lang];
};

/** `const money = useMoney(); money(18900)` → "189 €" / "807 zł" / "$206" */
export const useMoney = () => {
  const lang = useLang();
  const currency = useCurrency();
  const { data: rates = FALLBACK_RATES } = useQuery(ratesQueryOptions);
  return useCallback((cents: number) => formatMoney(cents, currency, lang, rates), [currency, lang, rates]);
};

export { CURRENCIES };

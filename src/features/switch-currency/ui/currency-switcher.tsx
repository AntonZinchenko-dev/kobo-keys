import { useTranslation } from 'react-i18next';

import { CURRENCIES, type Currency } from '@/shared/api';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import { useCurrency, useCurrencyStore } from '@/shared/lib';
import { Select } from '@/shared/ui';

const SYMBOL: Record<Currency, string> = { EUR: '€', PLN: 'zł', USD: '$' };

export const CurrencySwitcher = ({ className }: { className?: string }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const currency = useCurrency();
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  // "евро", "złoty polski", "US dollar" — names come from the browser, no translations needed
  const names = new Intl.DisplayNames([INTL_LOCALE[lang]], { type: 'currency' });
  const options = CURRENCIES.map((c) => ({
    value: c,
    label: c,
    short: `${SYMBOL[c]} ${c}`,
    lead: SYMBOL[c],
    hint: names.of(c),
  }));

  return (
    <Select
      label={t('settings.currency')}
      value={currency}
      options={options}
      onChange={setCurrency}
      align="end"
      {...(className ? { className } : {})}
    />
  );
};

import { useTranslation } from 'react-i18next';

import { CURRENCIES, type Currency } from '@/shared/api';
import { useCurrency, useCurrencyStore } from '@/shared/lib';
import { Icon } from '@/shared/ui';

import styles from './currency-switcher.module.css';

const SYMBOL: Record<Currency, string> = { EUR: '€', PLN: 'zł', USD: '$' };

export const CurrencySwitcher = () => {
  const { t } = useTranslation();
  const currency = useCurrency();
  const setCurrency = useCurrencyStore((s) => s.setCurrency);
  return (
    <label className={styles.wrap}>
      <Icon name="coins" size={18} />
      <span className="visually-hidden">{t('settings.currency')}</span>
      <select
        className={styles.select}
        value={currency}
        onChange={(e) => setCurrency(e.target.value as Currency)}
      >
        {CURRENCIES.map((c) => (
          <option key={c} value={c}>
            {c} {SYMBOL[c]}
          </option>
        ))}
      </select>
    </label>
  );
};

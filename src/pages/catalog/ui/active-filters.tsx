import { useTranslation } from 'react-i18next';

import { useMoney } from '@/shared/lib';
import { Icon } from '@/shared/ui';

import { activeCount, type Filters } from '../model/filters';

import styles from './catalog-page.module.css';

export const ActiveFilters = ({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) => {
  const { t } = useTranslation('shop');
  const { t: tc } = useTranslation();
  const money = useMoney();
  if (activeCount(filters) === 0) return null;

  const chips: { key: string; label: string; remove: () => void }[] = [
    ...filters.layout.map((l) => ({
      key: `l-${l}`,
      label: t(`layouts.${l}`),
      remove: () => onChange({ ...filters, layout: filters.layout.filter((x) => x !== l) }),
    })),
    ...filters.switchType.map((s) => ({
      key: `s-${s}`,
      label: t(`switchTypes.${s}`),
      remove: () => onChange({ ...filters, switchType: filters.switchType.filter((x) => x !== s) }),
    })),
    ...filters.color.map((c) => ({
      key: `c-${c}`,
      label: tc(`colors.${c}`),
      remove: () => onChange({ ...filters, color: filters.color.filter((x) => x !== c) }),
    })),
    ...(filters.priceMin !== undefined || filters.priceMax !== undefined
      ? [
          {
            key: 'price',
            label: `${filters.priceMin !== undefined ? money(filters.priceMin) : '…'} – ${filters.priceMax !== undefined ? money(filters.priceMax) : '…'}`,
            remove: () => onChange({ ...filters, priceMin: undefined, priceMax: undefined }),
          },
        ]
      : []),
    ...(filters.inStock
      ? [
          {
            key: 'stock',
            label: t('filters.inStock'),
            remove: () => onChange({ ...filters, inStock: false }),
          },
        ]
      : []),
  ];

  return (
    <ul className={styles.active} aria-label={t('filters.active')}>
      {chips.map((chip) => (
        <li key={chip.key}>
          <button
            type="button"
            className={styles.activeChip}
            onClick={chip.remove}
            aria-label={t('filters.removeOne', { name: chip.label })}
          >
            {chip.label}
            <Icon name="x" size={14} />
          </button>
        </li>
      ))}
      <li>
        <button
          type="button"
          className={styles.linkButton}
          onClick={() =>
            onChange({
              ...filters,
              layout: [],
              switchType: [],
              color: [],
              priceMin: undefined,
              priceMax: undefined,
              inStock: false,
            })
          }
        >
          {t('filters.reset')}
        </button>
      </li>
    </ul>
  );
};

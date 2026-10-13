import { type CSSProperties, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { COLOR_SWATCH } from '@/entities/product';
import { COLORS, type Facets, LAYOUTS, SWITCH_TYPES } from '@/shared/api';
import { useDebouncedValue, useMoney } from '@/shared/lib';
import { Check, Range } from '@/shared/ui';

import type { Filters } from '../model/filters';

import styles from './catalog-page.module.css';

interface FiltersPanelProps {
  value: Filters;
  facets: Facets | undefined;
  onChange: (next: Filters) => void;
}

const toggle = <T,>(list: T[], item: T) =>
  list.includes(item) ? list.filter((x) => x !== item) : [...list, item];

export const FiltersPanel = ({ value, facets, onChange }: FiltersPanelProps) => {
  const { t } = useTranslation('shop');
  const { t: tc } = useTranslation();
  const money = useMoney();
  const min = facets?.price.min ?? 0;
  const max = Math.max(facets?.price.max ?? 30000, min + 100);
  const committed: [number, number] = [value.priceMin ?? min, value.priceMax ?? max];
  // The slider moves instantly; the URL (and the request) updates once the thumb stops.
  const [range, setRange] = useState(committed);
  const debounced = useDebouncedValue(range, 350);
  const key = committed.join('-');
  useEffect(() => setRange(committed), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    const [from, to] = debounced;
    if (from === committed[0] && to === committed[1]) return;
    onChange({ ...value, priceMin: from <= min ? undefined : from, priceMax: to >= max ? undefined : to });
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className={styles.filters}>
      <fieldset className={styles.group}>
        <legend>{t('filters.availability')}</legend>
        <Check
          label={t('filters.inStock')}
          count={facets?.inStock}
          checked={value.inStock}
          onChange={(e) => onChange({ ...value, inStock: e.target.checked })}
        />
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{t('filters.layout')}</legend>
        {LAYOUTS.map((l) => {
          const count = facets?.layout[l] ?? 0;
          return (
            <Check
              key={l}
              label={t(`layouts.${l}`)}
              count={count}
              checked={value.layout.includes(l)}
              disabled={count === 0 && !value.layout.includes(l)}
              onChange={() => onChange({ ...value, layout: toggle(value.layout, l) })}
            />
          );
        })}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{t('filters.switch')}</legend>
        {SWITCH_TYPES.map((s) => {
          const count = facets?.switchType[s] ?? 0;
          return (
            <Check
              key={s}
              label={t(`switchTypes.${s}`)}
              count={count}
              checked={value.switchType.includes(s)}
              disabled={count === 0 && !value.switchType.includes(s)}
              onChange={() => onChange({ ...value, switchType: toggle(value.switchType, s) })}
            />
          );
        })}
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{t('filters.color')}</legend>
        <div className={styles.swatches}>
          {COLORS.map((c) => {
            const count = facets?.color[c] ?? 0;
            const active = value.color.includes(c);
            return (
              <button
                key={c}
                type="button"
                className={styles.swatch}
                style={{ '--swatch': COLOR_SWATCH[c] } as CSSProperties}
                aria-pressed={active}
                disabled={count === 0 && !active}
                title={`${tc(`colors.${c}`)} (${count})`}
                aria-label={`${tc(`colors.${c}`)}, ${t('filters.products', { count })}`}
                onClick={() => onChange({ ...value, color: toggle(value.color, c) })}
              />
            );
          })}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend>{t('filters.price')}</legend>
        <Range
          min={min}
          max={max}
          step={500}
          value={range}
          labels={[t('filters.priceFrom'), t('filters.priceTo')]}
          onChange={setRange}
        />
        <div className={styles.priceLabels}>
          <span>{money(range[0])}</span>
          <span>{money(range[1])}</span>
        </div>
      </fieldset>
    </div>
  );
};

import { useId, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';

import { shippingOptionsQuery } from '@/entities/cart';
import { api, type ShippingMethod } from '@/shared/api';
import { useDebouncedValue } from '@/shared/lib';
import { Field, Icon, type IconName, Input, Price, TextArea } from '@/shared/ui';

import type { CheckoutForm } from '../model/schema';

import styles from './checkout-page.module.css';

const ICON: Record<ShippingMethod, IconName> = { courier: 'truck', pickup: 'package', workshop: 'store' };
type ErrorKey = `errors.${'city' | 'street' | 'zip' | 'comment'}`;

export const DeliveryStep = () => {
  const { t } = useTranslation('checkout');
  const { register, watch, formState, setValue } = useFormContext<CheckoutForm>();
  const shipping = watch('shipping');
  const street = watch('street');
  const listId = useId();
  const [focused, setFocused] = useState(false);
  const query = useDebouncedValue(street, 250);
  const { data: options } = useQuery(shippingOptionsQuery);
  const { data: suggestions = [] } = useQuery({
    queryKey: ['address', query],
    queryFn: ({ signal }) => api<string[]>('/address/suggest', { query: { q: query }, signal }),
    enabled: focused && query.length >= 2,
  });
  const err = (key: 'city' | 'street' | 'zip' | 'comment') => {
    const message = formState.errors[key]?.message;
    return message ? t(message as ErrorKey) : undefined;
  };

  return (
    <section className={styles.step} aria-labelledby="step-delivery">
      <h2 id="step-delivery">{t('steps.delivery')}</h2>
      <div className={styles.methods} role="radiogroup" aria-label={t('delivery.method')}>
        {(options ?? []).map((o) => (
          <label key={o.id} className={clsx(styles.method, shipping === o.id && styles.methodActive)}>
            <input type="radio" value={o.id} {...register('shipping')} className="visually-hidden" />
            <Icon name={ICON[o.id]} size={22} />
            <span className={styles.methodText}>
              <strong>{t(`delivery.${o.id}`)}</strong>
              <span>
                {o.etaDays[1] === 0
                  ? t('delivery.today')
                  : t('delivery.days', { from: o.etaDays[0], to: o.etaDays[1] })}
              </span>
            </span>
            {o.price === 0 ? (
              <span className={styles.free}>{t('summary.free')}</span>
            ) : (
              <Price value={o.price} size="sm" />
            )}
          </label>
        ))}
      </div>

      {shipping === 'workshop' ? (
        <p className={styles.workshop}>
          <Icon name="map-pin" size={18} /> {t('delivery.workshopAddress')}
        </p>
      ) : (
        <div className={styles.fields}>
          <Field
            label={t('delivery.street')}
            error={err('street')}
            className={styles.full}
            hint={t('delivery.streetHint')}
          >
            <Input
              autoComplete="street-address"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={focused && suggestions.length > 0}
              aria-controls={listId}
              {...register('street', { onBlur: () => window.setTimeout(() => setFocused(false), 150) })}
              onFocus={() => setFocused(true)}
            />
          </Field>
          {focused && suggestions.length > 0 && (
            <ul id={listId} role="listbox" className={styles.suggestions}>
              {suggestions.map((s) => (
                <li key={s} role="option" aria-selected={false}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      const [city = '', ...rest] = s.split(', ');
                      setValue('city', city, { shouldValidate: true });
                      setValue('street', rest.join(', '), { shouldValidate: true });
                      setFocused(false);
                    }}
                  >
                    <Icon name="map-pin" size={16} /> {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Field label={t('delivery.city')} error={err('city')}>
            <Input autoComplete="address-level2" {...register('city')} />
          </Field>
          <Field label={t('delivery.zip')} error={err('zip')}>
            <Input autoComplete="postal-code" inputMode="numeric" {...register('zip')} />
          </Field>
        </div>
      )}
      <Field label={t('delivery.comment')} error={err('comment')}>
        <TextArea rows={2} placeholder={t('delivery.commentPlaceholder')} {...register('comment')} />
      </Field>
    </section>
  );
};

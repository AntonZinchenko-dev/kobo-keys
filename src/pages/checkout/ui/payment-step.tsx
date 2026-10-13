import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import type { PaymentMethod } from '@/shared/api';
import { Field, Icon, Input } from '@/shared/ui';

import { cardBrand, formatCardNumber, formatExpiry } from '../lib/card';
import type { CheckoutForm } from '../model/schema';

import styles from './checkout-page.module.css';

type ErrorKey = `errors.${'cardNumber' | 'cardExp' | 'cardCvc' | 'cardName'}`;
const METHODS: PaymentMethod[] = ['card', 'apple_pay', 'google_pay'];

export const PaymentStep = ({ error }: { error: string | null }) => {
  const { t } = useTranslation('checkout');
  const { register, watch, formState, setValue } = useFormContext<CheckoutForm>();
  const method = watch('method');
  const number = watch('cardNumber');
  const brand = cardBrand(number);
  const err = (key: 'cardNumber' | 'cardExp' | 'cardCvc' | 'cardName') => {
    const message = formState.errors[key]?.message;
    return message ? t(message as ErrorKey) : undefined;
  };

  return (
    <section className={styles.step} aria-labelledby="step-payment">
      <h2 id="step-payment">{t('steps.payment')}</h2>
      <div className={styles.methods} role="radiogroup" aria-label={t('payment.method')}>
        {METHODS.map((m) => (
          <label key={m} className={clsx(styles.method, method === m && styles.methodActive)}>
            <input type="radio" value={m} {...register('method')} className="visually-hidden" />
            <Icon name={m === 'card' ? 'credit-card' : 'zap'} size={22} />
            <span className={styles.methodText}>
              <strong>{t(`payment.methods.${m}`)}</strong>
            </span>
          </label>
        ))}
      </div>

      {method === 'card' && (
        <>
          {/* Live card preview: brand, number and name update as you type */}
          <div className={styles.cardPreview} data-brand={brand} aria-hidden="true">
            <div className={styles.cardFront}>
              <span className={styles.chip} />
              <span className={styles.cardBrand}>{brand === 'unknown' ? '' : brand.toUpperCase()}</span>
              <span className={styles.cardNumber}>{number || '•••• •••• •••• ••••'}</span>
              <span className={styles.cardName}>{watch('cardName') || t('payment.cardholder')}</span>
              <span className={styles.cardExp}>{watch('cardExp') || 'MM/YY'}</span>
            </div>
          </div>
          <div className={styles.fields}>
            <Field
              label={t('payment.cardNumber')}
              error={err('cardNumber')}
              className={styles.full}
              hint={t('payment.testHint')}
            >
              <Input
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="4242 4242 4242 4242"
                {...register('cardNumber', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    setValue('cardNumber', formatCardNumber(e.target.value)),
                })}
              />
            </Field>
            <Field label={t('payment.exp')} error={err('cardExp')}>
              <Input
                inputMode="numeric"
                autoComplete="cc-exp"
                placeholder="MM/YY"
                {...register('cardExp', {
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    setValue('cardExp', formatExpiry(e.target.value)),
                })}
              />
            </Field>
            <Field label="CVC" error={err('cardCvc')}>
              <Input
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={brand === 'amex' ? 4 : 3}
                placeholder="123"
                {...register('cardCvc')}
              />
            </Field>
            <Field label={t('payment.name')} error={err('cardName')} className={styles.full}>
              <Input autoComplete="cc-name" placeholder="ANNA KOWALSKA" {...register('cardName')} />
            </Field>
          </div>
        </>
      )}
      {method !== 'card' && <p className={styles.hint}>{t('payment.walletHint')}</p>}

      {error && (
        <div className={styles.paymentError} role="alert">
          <Icon name="triangle-alert" size={20} />
          <span>{error}</span>
        </div>
      )}
    </section>
  );
};

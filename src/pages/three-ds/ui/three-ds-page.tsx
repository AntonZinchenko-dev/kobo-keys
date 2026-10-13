import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useCartStore } from '@/entities/cart';
import { api, isApiError, type PaymentResponse } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Button, EmptyState, Field, Icon, Input, Price, Skeleton } from '@/shared/ui';

import styles from './three-ds-page.module.css';

/** Imitation of the bank's 3-D Secure page (a fictional bank — never imitates a real one). */
export const ThreeDsPage = () => {
  const { t } = useTranslation('checkout');
  const lang = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const paymentId = params.get('payment') ?? '';
  const clearCart = useCartStore((s) => s.clear);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const { data, isError } = useQuery({
    queryKey: ['payment', paymentId],
    queryFn: () => api<{ orderId: string; total: number; last4: string }>(`/payments/${paymentId}`),
    enabled: paymentId !== '',
    retry: false,
  });

  const confirm = useMutation({
    mutationFn: (value: string) =>
      api<PaymentResponse>(`/payments/${paymentId}/confirm`, { method: 'POST', body: { code: value } }),
    onSuccess: (result) => {
      clearCart();
      void navigate(`${paths.order(lang, result.orderId)}?new=1`, { replace: true });
    },
    onError: (e) => {
      if (isApiError(e) && e.code === 'INVALID_CODE') {
        const left = (e.details as { attemptsLeft?: number } | undefined)?.attemptsLeft ?? 0;
        setError(t('threeDs.wrong', { count: left }));
      } else if (isApiError(e) && e.code === 'AUTH_FAILED') {
        setError(t('threeDs.failed'));
        window.setTimeout(() => void navigate(paths.checkout(lang), { replace: true }), 1800);
      } else {
        setError(t('payment.errors.GENERIC'));
      }
    },
  });

  if (isError || !paymentId) {
    return (
      <div className="container">
        <EmptyState mascot="error" title={t('threeDs.expired')} />
      </div>
    );
  }

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!/^\d{4}$/.test(code)) {
      setError(t('threeDs.format'));
      return;
    }
    confirm.mutate(code);
  };

  return (
    <div className={styles.page}>
      <title>{`${t('threeDs.title')} — KŌBŌ Keys`}</title>
      <form className={styles.bank} onSubmit={submit} noValidate>
        <header className={styles.head}>
          <span className={styles.logo}>
            <Icon name="shield-check" size={22} /> Sakura Bank <small>SecureCode</small>
          </span>
          <span className={styles.demo}>{t('threeDs.demo')}</span>
        </header>
        <h1>{t('threeDs.title')}</h1>
        {!data ? (
          <Skeleton style={{ height: 60 }} />
        ) : (
          <dl className={styles.details}>
            <div>
              <dt>{t('threeDs.merchant')}</dt>
              <dd>KŌBŌ Keys</dd>
            </div>
            <div>
              <dt>{t('threeDs.amount')}</dt>
              <dd>
                <Price value={data.total} />
              </dd>
            </div>
            <div>
              <dt>{t('threeDs.card')}</dt>
              <dd>•••• {data.last4}</dd>
            </div>
          </dl>
        )}
        <p className={styles.text}>{t('threeDs.text')}</p>
        <Field label={t('threeDs.code')} error={error} hint={t('threeDs.hint')}>
          <Input
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={4}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ''));
              setError(undefined);
            }}
            className={styles.code}
            // eslint-disable-next-line jsx-a11y/no-autofocus -- focus moves into the field that just appeared (dialog / next step)
            autoFocus
          />
        </Field>
        <Button type="submit" size="lg" block loading={confirm.isPending}>
          {t('threeDs.confirm')}
        </Button>
        <Button variant="ghost" block onClick={() => void navigate(paths.checkout(lang))}>
          {t('threeDs.cancel')}
        </Button>
      </form>
    </div>
  );
};

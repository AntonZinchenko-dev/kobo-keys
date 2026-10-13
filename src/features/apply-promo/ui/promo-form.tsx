import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';

import { useCartStore, validatePromo } from '@/entities/cart';
import { isApiError } from '@/shared/api';
import { Badge, Button, Field, IconButton, Input } from '@/shared/ui';

import styles from './promo-form.module.css';

export const PromoForm = () => {
  const { t } = useTranslation('checkout');
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();

  const { mutate, isPending } = useMutation({
    mutationFn: validatePromo,
    onSuccess: (result) => {
      setPromo(result.code);
      setCode('');
      setError(undefined);
    },
    onError: (e) => {
      const known = isApiError(e) && (e.code === 'PROMO_NOT_FOUND' || e.code === 'PROMO_EXPIRED');
      setError(known ? t(`promo.errors.${e.code}`) : t('promo.errors.generic'));
    },
  });

  if (promo) {
    return (
      <div className={styles.applied}>
        <Badge tone="matcha">{promo}</Badge>
        <span>{t('promo.applied')}</span>
        <IconButton icon="x" label={t('promo.remove')} onClick={() => setPromo(null)} />
      </div>
    );
  }

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (code.trim()) mutate(code.trim());
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <Field label={t('promo.label')} error={error} hint={t('promo.hint')}>
        <Input
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase());
            setError(undefined);
          }}
          placeholder="KOBO10"
          autoComplete="off"
          spellCheck={false}
        />
      </Field>
      <Button type="submit" variant="secondary" loading={isPending} className={styles.button}>
        {t('promo.apply')}
      </Button>
    </form>
  );
};

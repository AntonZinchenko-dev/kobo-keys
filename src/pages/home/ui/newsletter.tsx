import { type SyntheticEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Field, Input, toast } from '@/shared/ui';

import styles from './newsletter.module.css';

export const Newsletter = () => {
  const { t } = useTranslation('home');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string>();

  const submit = (e: SyntheticEvent) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t('newsletter.invalid'));
      return;
    }
    setError(undefined);
    setEmail('');
    toast.success(t('newsletter.done'));
  };

  return (
    <section className={`${styles.newsletter} reveal`} aria-labelledby="newsletter-title">
      <div>
        <h2 id="newsletter-title">{t('newsletter.title')}</h2>
        <p>{t('newsletter.text')}</p>
      </div>
      <form className={styles.form} onSubmit={submit} noValidate>
        <Field label={t('newsletter.label')} error={error}>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </Field>
        <Button type="submit" className={styles.button} iconEnd="mail">
          {t('newsletter.cta')}
        </Button>
      </form>
    </section>
  );
};

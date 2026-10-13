import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { useIsAuthorized } from '@/entities/session';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Field, Input } from '@/shared/ui';

import { formatPhone } from '../lib/card';
import type { CheckoutForm } from '../model/schema';

import styles from './checkout-page.module.css';

type ErrorKey = `errors.${'email' | 'name' | 'phone'}`;

export const ContactStep = () => {
  const { t } = useTranslation('checkout');
  const lang = useLang();
  const authorized = useIsAuthorized();
  const { register, formState, setValue } = useFormContext<CheckoutForm>();
  const err = (key: 'email' | 'name' | 'phone') => {
    const message = formState.errors[key]?.message;
    return message ? t(message as ErrorKey) : undefined;
  };

  return (
    <section className={styles.step} aria-labelledby="step-contact">
      <h2 id="step-contact">{t('steps.contact')}</h2>
      {!authorized && (
        <p className={styles.hint}>
          {t('contact.haveAccount')}{' '}
          <Link to={paths.login(lang, paths.checkout(lang))}>{t('contact.signIn')}</Link>
        </p>
      )}
      <div className={styles.fields}>
        <Field label={t('contact.email')} error={err('email')} className={styles.full}>
          <Input type="email" autoComplete="email" inputMode="email" {...register('email')} />
        </Field>
        <Field label={t('contact.name')} error={err('name')}>
          <Input autoComplete="name" {...register('name')} />
        </Field>
        <Field label={t('contact.phone')} error={err('phone')} hint={t('contact.phoneHint')}>
          <Input
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+48 123 456 789"
            {...register('phone', {
              onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                setValue('phone', formatPhone(e.target.value)),
            })}
          />
        </Field>
      </div>
    </section>
  );
};

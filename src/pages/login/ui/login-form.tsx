import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';

import { requestCode, useSessionStore, verifyCode } from '@/entities/session';
import { isApiError } from '@/shared/api';
import { Button, Field, Input } from '@/shared/ui';

import styles from './login-form.module.css';

const emailSchema = z.object({ email: z.string().trim().email() });
const codeSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

/** Passwordless sign-in: email → 6-digit code (in the demo any email works, the code is 000000). */
export const LoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const { t } = useTranslation('account');
  const setSession = useSessionStore((s) => s.setSession);
  const [email, setEmail] = useState<string | null>(null);

  const emailForm = useForm<z.infer<typeof emailSchema>>({ resolver: zodResolver(emailSchema) });
  const codeForm = useForm<z.infer<typeof codeSchema>>({ resolver: zodResolver(codeSchema) });

  const sendCode = useMutation({
    mutationFn: (value: string) => requestCode(value),
    onSuccess: (_d, value) => setEmail(value),
  });
  const verify = useMutation({
    mutationFn: (code: string) => verifyCode(email ?? '', code),
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      onSuccess();
    },
    onError: (e) => {
      codeForm.setError('code', {
        message: isApiError(e) && e.code === 'INVALID_CODE' ? t('login.wrongCode') : t('login.failed'),
      });
    },
  });

  if (!email) {
    return (
      <form
        className={styles.form}
        noValidate
        onSubmit={emailForm.handleSubmit(({ email: value }) => sendCode.mutate(value))}
      >
        <Field label={t('login.email')} error={emailForm.formState.errors.email && t('login.invalidEmail')}>
          <Input
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            {...emailForm.register('email')}
          />
        </Field>
        <Button type="submit" size="lg" block loading={sendCode.isPending} iconEnd="arrow-right">
          {t('login.sendCode')}
        </Button>
      </form>
    );
  }

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={codeForm.handleSubmit(({ code }) => verify.mutate(code))}
    >
      <p className={styles.sent}>{t('login.codeSent', { email })}</p>
      <Field
        label={t('login.code')}
        hint={t('login.codeHint')}
        error={
          codeForm.formState.errors.code && (codeForm.formState.errors.code.message ?? t('login.codeFormat'))
        }
      >
        <Input
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className={styles.code}
          // eslint-disable-next-line jsx-a11y/no-autofocus -- focus moves into the field that just appeared (dialog / next step)
          autoFocus
          {...codeForm.register('code')}
        />
      </Field>
      <Button type="submit" size="lg" block loading={verify.isPending}>
        {t('login.signIn')}
      </Button>
      <Button variant="ghost" onClick={() => setEmail(null)}>
        {t('login.changeEmail')}
      </Button>
    </form>
  );
};

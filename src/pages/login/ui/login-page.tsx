import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router';

import { useIsAuthorized } from '@/entities/session';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Picture } from '@/shared/ui';

import { LoginForm } from './login-form';

import styles from './login-page.module.css';

export const LoginPage = () => {
  const { t } = useTranslation('account');
  const lang = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const authorized = useIsAuthorized();
  const raw = params.get('returnTo');
  // Only same-site paths are allowed as a return target (no open redirect)
  const returnTo = raw?.startsWith(`/${lang}`) ? raw : paths.account(lang);

  if (authorized) return <Navigate to={returnTo} replace />;

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('login.title')} — KŌBŌ Keys`}</title>
      <div className={styles.card}>
        <div className={styles.mascot}>
          <Picture slot="mascot/hello" alt="" ratio={1} sizes="112px" />
        </div>
        <h1>{t('login.title')}</h1>
        <p className={styles.lead}>{t('login.lead')}</p>
        <LoginForm onSuccess={() => void navigate(returnTo, { replace: true })} />
        <p className={styles.demo}>{t('login.demo')}</p>
      </div>
    </div>
  );
};

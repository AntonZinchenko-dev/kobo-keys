import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { useMutation } from '@tanstack/react-query';

import { LanguageSwitcher } from '@/features/switch-language';
import { ThemeToggle } from '@/features/toggle-theme';
import { useIsAuthorized, useSessionStore, verifyCode } from '@/entities/session';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Button, Icon, Logo, Picture } from '@/shared/ui';

import { LoginForm } from './login-form';

import styles from './login-page.module.css';

/** The demo backend accepts any email with the code 000000 — the demo button just does both steps at once */
const DEMO_EMAIL = 'yuki@kobo.keys';
const DEMO_CODE = '000000';

/** Entry screen of the app: everything else is behind the session. */
export const LoginPage = () => {
  const { t } = useTranslation('account');
  const lang = useLang();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const authorized = useIsAuthorized();
  const setSession = useSessionStore((s) => s.setSession);
  const raw = params.get('returnTo');
  // Only same-site paths are allowed as a return target (no open redirect)
  const returnTo = raw?.startsWith(`/${lang}`) && !raw.startsWith('//') ? raw : paths.home(lang);
  const enter = () => void navigate(returnTo, { replace: true, viewTransition: true });

  const demo = useMutation({
    mutationFn: () => verifyCode(DEMO_EMAIL, DEMO_CODE),
    onSuccess: ({ token, user }) => {
      setSession(token, user);
      enter();
    },
  });

  if (authorized) return <Navigate to={returnTo} replace />;

  return (
    <div className={styles.screen}>
      <title>{`${t('login.title')} — KŌBŌ Keys`}</title>

      <aside className={styles.art} aria-hidden="true">
        <Picture
          slot="marketing/hero"
          mobileSlot="marketing/hero-mobile"
          alt=""
          ratio={16 / 9}
          sizes="(min-width: 960px) 55vw, 100vw"
          priority
          className={styles.artImage}
        />
        <span className={styles.kanji} lang="ja">
          工房
        </span>
        <div className={styles.artText}>
          <p className={styles.kicker}>{t('login.kicker')}</p>
          <p className={styles.artTitle}>{t('login.artTitle')}</p>
          <ul className={styles.perks}>
            {(['perk1', 'perk2', 'perk3'] as const).map((key) => (
              <li key={key}>
                <Icon name="check" size={16} />
                {t(`login.${key}`)}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className={styles.panel}>
        <header className={styles.top}>
          <Logo />
          <div className={styles.tools}>
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <div className={styles.card}>
          <div className={styles.badge} aria-hidden="true">
            <Logo compact />
          </div>
          <h1 className={styles.title}>{t('login.title')}</h1>
          <p className={styles.lead}>{t('login.lead')}</p>

          <LoginForm onSuccess={enter} />

          <p className={styles.divider}>
            <span>{t('login.or')}</span>
          </p>

          <Button
            variant="secondary"
            size="lg"
            block
            icon="sparkles"
            loading={demo.isPending}
            onClick={() => demo.mutate()}
            className={styles.demoButton}
          >
            {t('login.demoButton')}
          </Button>
          {demo.isError && (
            <p className={styles.error} role="alert">
              {t('login.failed')}
            </p>
          )}
          <p className={styles.demo}>
            {t('login.demoHint')} · {t('login.demo')}
          </p>
        </div>
      </main>
    </div>
  );
};

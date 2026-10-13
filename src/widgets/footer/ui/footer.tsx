import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';

import { CurrencySwitcher } from '@/features/switch-currency';
import { LanguageSwitcher } from '@/features/switch-language';
import { CATEGORIES } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Logo } from '@/shared/ui';

import styles from './footer.module.css';

export const Footer = () => {
  const { t } = useTranslation();
  const lang = useLang();
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brand}>
          <Logo />
          <p>{t('footer.about')}</p>
          <div className={styles.settings}>
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
        </div>
        <nav aria-label={t('footer.shop')}>
          <h2 className={styles.title}>{t('footer.shop')}</h2>
          <ul>
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link to={paths.catalog(lang, c)}>{t(`categories.${c}`)}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label={t('footer.more')}>
          <h2 className={styles.title}>{t('footer.more')}</h2>
          <ul>
            <li>
              <Link to={paths.builder(lang)}>{t('nav.builder')}</Link>
            </li>
            <li>
              <Link to={paths.club(lang)}>{t('nav.club')}</Link>
            </li>
            <li>
              <Link to={paths.compare(lang)}>{t('nav.compare')}</Link>
            </li>
            <li>
              <Link to={paths.wishlist(lang)}>{t('nav.wishlist')}</Link>
            </li>
          </ul>
        </nav>
        <div>
          <h2 className={styles.title}>{t('footer.demo')}</h2>
          <p className={styles.note}>{t('footer.demoText')}</p>
        </div>
      </div>
      <div className={`container ${styles.bottom}`}>
        <span>© 2026 KŌBŌ Keys · {t('footer.portfolio')}</span>
        <span lang="ja" className={styles.kanji} aria-hidden="true">
          工房
        </span>
      </div>
    </footer>
  );
};

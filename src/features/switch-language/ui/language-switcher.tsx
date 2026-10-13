import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { type Lang, LANGS } from '@/shared/api';
import { i18n, LANG_STORAGE_KEY, useLang } from '@/shared/i18n';
import { Icon } from '@/shared/ui';

import styles from './language-switcher.module.css';

const NAMES: Record<Lang, string> = { ru: 'Русский', en: 'English', pl: 'Polski' };

/** Swaps the language segment of the current URL, keeping path, filters and scroll context. */
export const LanguageSwitcher = () => {
  const { t } = useTranslation();
  const lang = useLang();
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  const change = (next: Lang) => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, next);
    } catch {
      // ignore
    }
    void i18n.changeLanguage(next);
    void navigate(pathname.replace(/^\/(ru|en|pl)(?=\/|$)/, `/${next}`) + search + hash, {
      replace: true,
      viewTransition: true,
      preventScrollReset: true,
    });
  };

  return (
    <label className={styles.wrap}>
      <Icon name="languages" size={18} />
      <span className="visually-hidden">{t('settings.language')}</span>
      <select className={styles.select} value={lang} onChange={(e) => change(e.target.value as Lang)}>
        {LANGS.map((l) => (
          <option key={l} value={l} lang={l}>
            {NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
};

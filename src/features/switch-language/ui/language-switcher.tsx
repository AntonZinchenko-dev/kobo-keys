import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';

import { type Lang, LANGS } from '@/shared/api';
import { i18n, LANG_STORAGE_KEY, useLang } from '@/shared/i18n';
import { Select } from '@/shared/ui';

const NAMES: Record<Lang, string> = { ru: 'Русский', en: 'English', pl: 'Polski' };

const OPTIONS = LANGS.map((l) => ({
  value: l,
  label: NAMES[l],
  short: l.toUpperCase(),
  lead: l.toUpperCase(),
  lang: l,
}));

/** Swaps the language segment of the current URL, keeping path, filters and scroll context. */
export const LanguageSwitcher = ({ className }: { className?: string }) => {
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
    <Select
      label={t('settings.language')}
      icon="languages"
      value={lang}
      options={OPTIONS}
      onChange={change}
      align="end"
      {...(className ? { className } : {})}
    />
  );
};

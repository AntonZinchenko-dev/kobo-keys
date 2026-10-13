import { initReactI18next } from 'react-i18next';
import i18n, { type PostProcessorModule } from 'i18next';
import ICU from 'i18next-icu';
import resourcesToBackend from 'i18next-resources-to-backend';

import { type Lang, LANGS } from '@/shared/api/contracts';

export const NAMESPACES = ['common', 'home', 'shop', 'checkout', 'account', 'builder'] as const;
export type Namespace = (typeof NAMESPACES)[number];

export const LANG_STORAGE_KEY = 'kobo-lang';
export const PSEUDO_STORAGE_KEY = 'kobo-pseudo';

export const isLang = (value: unknown): value is Lang =>
  typeof value === 'string' && (LANGS as readonly string[]).includes(value);

export const INTL_LOCALE: Record<Lang, string> = { ru: 'ru-RU', en: 'en-GB', pl: 'pl-PL' };

/** Language for the first visit: saved choice → browser languages → English. */
export const detectLang = (): Lang => {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(saved)) return saved;
  } catch {
    // storage blocked
  }
  for (const tag of navigator.languages) {
    const short = tag.slice(0, 2).toLowerCase();
    if (isLang(short)) return short;
  }
  return 'en';
};

const isPseudo = () => {
  try {
    return localStorage.getItem(PSEUDO_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
};

const ACCENTS: Record<string, string> = {
  a: 'á',
  e: 'ë',
  i: 'ï',
  o: 'ö',
  u: 'ü',
  c: 'ç',
  n: 'ñ',
  s: 'š',
  y: 'ÿ',
  z: 'ž',
};

/**
 * Pseudo-localisation: every string becomes ~40% longer and gets wrapped in brackets.
 * Instantly shows untranslated strings and layouts that break on long words (dev panel toggle).
 */
const pseudo: PostProcessorModule = {
  type: 'postProcessor',
  name: 'pseudo',
  process: (value: string) => {
    const accented = value.replace(/[a-z]/gi, (ch) => ACCENTS[ch.toLowerCase()] ?? ch);
    return `[${accented}${'~'.repeat(Math.ceil(value.length * 0.4))}]`;
  },
};

export const initI18n = (lng: Lang) =>
  i18n
    .use(ICU)
    .use(pseudo)
    .use(initReactI18next)
    .use(
      // Each namespace is a separate chunk: a page loads only its own texts in the current language.
      resourcesToBackend(
        (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`),
      ),
    )
    .init({
      lng,
      fallbackLng: false,
      supportedLngs: [...LANGS],
      ns: ['common'],
      defaultNS: 'common',
      interpolation: { escapeValue: false },
      postProcess: isPseudo() ? ['pseudo'] : false,
      react: { useSuspense: true },
      returnNull: false,
    });

export { i18n };

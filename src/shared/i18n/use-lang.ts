import { useParams } from 'react-router';

import type { Lang } from '@/shared/api/contracts';

import { isLang } from './config';

/** Current language is part of the URL (/ru/…), so the router is the source of truth. */
export const useLang = (): Lang => {
  const { lang } = useParams();
  return isLang(lang) ? lang : 'en';
};

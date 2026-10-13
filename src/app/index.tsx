import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { detectLang, initI18n, isLang } from '@/shared/i18n';

import { App } from './app';

import './styles/base.css';
import './styles/tokens.css';

import '@fontsource-variable/unbounded';
import '@fontsource-variable/onest';
import '@fontsource-variable/jetbrains-mono';

/** Language from the URL (/kobo-keys/<lang>/…) so the first render is already in the right language. */
const langFromUrl = () => {
  const rest = window.location.pathname.slice(import.meta.env.BASE_URL.length);
  const segment = rest.split('/')[0];
  return isLang(segment) ? segment : detectLang();
};

const boot = async () => {
  // The mock backend must be listening before the first request, so the app renders after it starts.
  // The mock backend is its own chunk, downloaded in parallel with the translations.
  const startMockBackend = import('@mocks/browser').then((m) => m.startMockBackend());
  await Promise.all([startMockBackend, initI18n(langFromUrl())]);
  const root = document.getElementById('root');
  if (!root) throw new Error('#root not found');
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
  const splash = document.getElementById('splash');
  splash?.classList.add('hide');
  window.setTimeout(() => splash?.remove(), 500);
};

void boot();

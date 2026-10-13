import { flushSync } from 'react-dom';

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Runs a DOM update inside the View Transitions API when the browser supports it,
 * and simply runs it otherwise (progressive enhancement).
 */
export const withViewTransition = (update: () => void) => {
  if (!('startViewTransition' in document) || reducedMotion()) {
    update();
    return null;
  }
  return document.startViewTransition(() => {
    flushSync(update);
  });
};

export const supportsViewTransitions = () =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

export const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

export const useDebouncedValue = <T>(value: T, delay = 250) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
};

export const useOnline = () =>
  useSyncExternalStore(
    (onChange) => {
      window.addEventListener('online', onChange);
      window.addEventListener('offline', onChange);
      return () => {
        window.removeEventListener('online', onChange);
        window.removeEventListener('offline', onChange);
      };
    },
    () => navigator.onLine,
    () => true,
  );

/** Counts down to a date; returns null when it has passed. */
export const useCountdown = (target: number) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const left = Math.max(0, target - now);
  return {
    done: left === 0,
    days: Math.floor(left / 86_400_000),
    hours: Math.floor(left / 3_600_000) % 24,
    minutes: Math.floor(left / 60_000) % 60,
    seconds: Math.floor(left / 1000) % 60,
  };
};

/** Keeps the latest callback in a ref — for event listeners that must not re-subscribe. */
export const useLatest = <T>(value: T) => {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  });
  return ref;
};

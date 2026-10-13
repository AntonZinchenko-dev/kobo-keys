/**
 * Settings of the "developer panel": network latency, random errors, offline mode and scenarios.
 * Stored in localStorage so the UI panel (src/widgets/dev-panel) and MSW handlers share them.
 */
export type Latency = 'fast' | 'normal' | 'slow3g';
export type Scenario = 'none' | 'out-of-stock-on-checkout' | 'payment-server-down';

export interface DevSettings {
  latency: Latency;
  errorRate: 0 | 0.1 | 0.5;
  offline: boolean;
  scenario: Scenario;
}

export const DEV_SETTINGS_KEY = 'kobo-dev-settings';
export const DEV_SETTINGS_EVENT = 'kobo:dev-settings';

export const DEFAULT_DEV_SETTINGS: DevSettings = {
  latency: 'normal',
  errorRate: 0,
  offline: false,
  scenario: 'none',
};

export const readDevSettings = (): DevSettings => {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_DEV_SETTINGS;
    const raw = localStorage.getItem(DEV_SETTINGS_KEY);
    return raw
      ? { ...DEFAULT_DEV_SETTINGS, ...(JSON.parse(raw) as Partial<DevSettings>) }
      : DEFAULT_DEV_SETTINGS;
  } catch {
    return DEFAULT_DEV_SETTINGS;
  }
};

export const writeDevSettings = (patch: Partial<DevSettings>) => {
  const next = { ...readDevSettings(), ...patch };
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(DEV_SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // storage blocked — settings just won't persist
  }
  if (typeof window !== 'undefined')
    window.dispatchEvent(new CustomEvent(DEV_SETTINGS_EVENT, { detail: next }));
  return next;
};

export const LATENCY_MS: Record<Latency, [number, number]> = {
  fast: [40, 120],
  normal: [300, 1200],
  slow3g: [1800, 3200],
};

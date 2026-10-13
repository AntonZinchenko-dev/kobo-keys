import type { ColorId } from '@/shared/api';

/** Swatches for the colour filter; the label comes from i18n (common:colors.*). */
export const COLOR_SWATCH: Record<ColorId, string> = {
  pink: 'oklch(80% 0.11 355)',
  white: 'oklch(96% 0.01 85)',
  black: 'oklch(22% 0.01 290)',
  green: 'oklch(68% 0.11 135)',
  blue: 'oklch(62% 0.12 250)',
  red: 'oklch(55% 0.19 25)',
  orange: 'oklch(72% 0.16 55)',
  yellow: 'oklch(87% 0.14 95)',
  purple: 'oklch(58% 0.17 300)',
  wood: 'oklch(70% 0.08 70)',
};

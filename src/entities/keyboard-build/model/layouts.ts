import type { KeyboardBuild } from '@/shared/api';

export type KeyRole = 'alpha' | 'mod' | 'accent' | 'space';

export interface KeyShape {
  x: number;
  y: number;
  w: number;
  role: KeyRole;
}

type Row = (number | [number, KeyRole] | { gap: number })[];

/** Rows in key units (1u = one standard key). Numbers are alpha keys of that width. */
const MAIN_60: Row[] = [
  [[1, 'accent'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2, 'mod']],
  [[1.5, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [1.5, 'mod']],
  [[1.75, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2.25, 'accent']],
  [[2.25, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2.75, 'mod']],
  [
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [6.25, 'space'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
  ],
];

const MAIN_65: Row[] = [
  [[1, 'accent'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2, 'mod'], [1, 'mod']],
  [[1.5, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [1.5, 'mod'], [1, 'mod']],
  [[1.75, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2.25, 'accent'], [1, 'mod']],
  [[2.25, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [1.75, 'mod'], [1, 'mod'], [1, 'mod']],
  [
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [6.25, 'space'],
    [1, 'mod'],
    [1, 'mod'],
    [1, 'mod'],
    [1, 'mod'],
    [1, 'mod'],
    [1, 'mod'],
  ],
];

const F_ROW_75: Row = [
  [1, 'accent'],
  { gap: 0.25 },
  ...Array<[number, KeyRole]>(12).fill([1, 'mod']),
  { gap: 0.25 },
  [1.5, 'mod'],
];

const MAIN_TKL: Row[] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2, 'mod'], { gap: 0.25 }, [1, 'mod'], [1, 'mod'], [1, 'mod']],
  [
    [1.5, 'mod'],
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    [1.5, 'mod'],
    { gap: 0.25 },
    [1, 'mod'],
    [1, 'mod'],
    [1, 'mod'],
  ],
  [[1.75, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2.25, 'accent']],
  [[2.25, 'mod'], 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, [2.75, 'mod'], { gap: 1.25 }, [1, 'mod']],
  [
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [6.25, 'space'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    [1.25, 'mod'],
    { gap: 0.25 },
    [1, 'mod'],
    [1, 'mod'],
    [1, 'mod'],
  ],
];

const F_ROW_TKL: Row = [
  [1, 'accent'],
  { gap: 1 },
  1,
  1,
  1,
  1,
  { gap: 0.5 },
  1,
  1,
  1,
  1,
  { gap: 0.5 },
  1,
  1,
  1,
  1,
  { gap: 0.25 },
  [1, 'mod'],
  [1, 'mod'],
  [1, 'mod'],
].map((k) => (typeof k === 'number' ? ([k, 'mod'] as [number, KeyRole]) : k)) as Row;

const LAYOUTS: Record<KeyboardBuild['layout'], { rows: Row[]; fGap: boolean }> = {
  '60': { rows: MAIN_60, fGap: false },
  '65': { rows: MAIN_65, fGap: false },
  '75': { rows: [F_ROW_75, ...MAIN_65], fGap: true },
  tkl: { rows: [F_ROW_TKL, ...MAIN_TKL], fGap: true },
};

export const keyShapes = (layout: KeyboardBuild['layout']) => {
  const { rows, fGap } = LAYOUTS[layout];
  const keys: KeyShape[] = [];
  let width = 0;
  rows.forEach((row, r) => {
    let x = 0;
    const y = r + (fGap && r > 0 ? 0.25 : 0);
    for (const item of row) {
      if (typeof item === 'object' && !Array.isArray(item)) {
        x += item.gap;
        continue;
      }
      const [w, role] = Array.isArray(item) ? item : [item, 'alpha' as const];
      // The first key of the main block is Esc only on 60/65 (no F-row)
      const fixedRole = r === (fGap ? 1 : -1) && x === 0 && role === 'accent' ? 'mod' : role;
      keys.push({ x, y, w, role: fixedRole });
      x += w;
    }
    width = Math.max(width, x);
  });
  const height = Math.max(...keys.map((k) => k.y)) + 1;
  return { keys, width, height };
};

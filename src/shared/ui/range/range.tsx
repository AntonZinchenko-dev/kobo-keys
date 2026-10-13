import type { CSSProperties } from 'react';

import styles from './range.module.css';

interface RangeProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  labels: [string, string];
}

/** Dual-thumb slider made of two native range inputs — keyboard and screen readers work out of the box. */
export const Range = ({ min, max, step = 100, value, onChange, labels }: RangeProps) => {
  const span = Math.max(1, max - min);
  const from = ((value[0] - min) / span) * 100;
  const to = ((value[1] - min) / span) * 100;
  return (
    <div className={styles.range} style={{ '--from': `${from}%`, '--to': `${to}%` } as CSSProperties}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[0]}
        aria-label={labels[0]}
        onChange={(e) => onChange([Math.min(Number(e.target.value), value[1]), value[1]])}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value[1]}
        aria-label={labels[1]}
        onChange={(e) => onChange([value[0], Math.max(Number(e.target.value), value[0])])}
      />
    </div>
  );
};

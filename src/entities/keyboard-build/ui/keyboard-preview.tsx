import { type CSSProperties, forwardRef, useId, useMemo } from 'react';
import clsx from 'clsx';

import type { BuilderOptions, KeyboardBuild } from '@/shared/api';

import { keyShapes } from '../model/layouts';

import styles from './keyboard-preview.module.css';

interface KeyboardPreviewProps {
  build: KeyboardBuild;
  options: BuilderOptions;
  title: string;
  className?: string;
  /** Static thumbnail: no lighting animation */
  still?: boolean;
}

const U = 40;
const PAD = 18;
const GAP = 3;

/**
 * The whole keyboard is drawn in SVG from the build config — any combination of layout,
 * case, keycaps and lighting renders instantly, no photo per variant needed.
 */
export const KeyboardPreview = forwardRef<SVGSVGElement, KeyboardPreviewProps>(
  ({ build, options, title, className, still }, ref) => {
    const { keys, width, height } = useMemo(() => keyShapes(build.layout), [build.layout]);
    const caseColor = options.cases.find((c) => c.id === build.case)?.color ?? '#ddd';
    const caps = options.keycaps.find((k) => k.id === build.keycaps) ?? options.keycaps[0];
    const uid = `kb${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
    const W = width * U + PAD * 2;
    const H = height * U + PAD * 2;
    const fill = (role: string) =>
      role === 'accent' || role === 'space' ? caps?.accent : role === 'mod' ? caps?.mod : caps?.alpha;
    const lightingClass = still ? undefined : styles[build.lighting];

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className={clsx(styles.svg, lightingClass, className)}
        role="img"
        aria-label={title}
        xmlns="http://www.w3.org/2000/svg"
      >
        <title>{title}</title>
        <defs>
          <linearGradient id={`${uid}-case`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#000" stopOpacity="0.18" />
          </linearGradient>
          <linearGradient id={`${uid}-cap`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x="2"
          y="6"
          width={W - 4}
          height={H - 4}
          rx="22"
          fill="#000"
          opacity="0.35"
          className={styles.shadow}
        />
        <rect width={W} height={H - 4} rx="22" fill={caseColor} className={styles.case} />
        <rect width={W} height={H - 4} rx="22" fill={`url(#${uid}-case)`} />
        <g transform={`translate(${PAD} ${PAD - 2})`}>
          {build.lighting !== 'off' &&
            keys.map((k, i) => (
              <rect
                key={`l${i}`}
                x={k.x * U - 1}
                y={k.y * U - 1}
                width={k.w * U - GAP + 2}
                height={U - GAP + 2}
                rx="7"
                className={styles.light}
                style={{ '--k': Math.round(k.x + k.y * 2) } as CSSProperties}
              />
            ))}
          {keys.map((k, i) => {
            const x = k.x * U;
            const y = k.y * U;
            const w = k.w * U - GAP;
            const h = U - GAP;
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} rx="6" fill={fill(k.role)} />
                <rect x={x} y={y} width={w} height={h} rx="6" fill="#000" opacity="0.18" />
                <rect x={x + 4} y={y + 2} width={w - 8} height={h - 9} rx="5" fill={fill(k.role)} />
                <rect x={x + 4} y={y + 2} width={w - 8} height={h - 9} rx="5" fill={`url(#${uid}-cap)`} />
                {k.role === 'space' && build.engraving && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 + 1}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={styles.engraving}
                    fill={caps?.alpha}
                  >
                    {build.engraving}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  },
);
KeyboardPreview.displayName = 'KeyboardPreview';

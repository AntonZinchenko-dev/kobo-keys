import type { SVGProps } from 'react';

import type { IconName } from './names';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  /** Accessible label; without it the icon is decorative and hidden from screen readers */
  label?: string;
}

const sprite = `${import.meta.env.BASE_URL}sprite.svg`;

export const Icon = ({ name, size = 20, label, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden={label ? undefined : true}
    role={label ? 'img' : undefined}
    aria-label={label}
    focusable="false"
    {...rest}
  >
    <use href={`${sprite}#${name}`} />
  </svg>
);

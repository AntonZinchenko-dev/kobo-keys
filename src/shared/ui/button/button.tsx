import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import clsx from 'clsx';

import { Icon } from '../icon/icon';
import type { IconName } from '../icon/names';

import styles from './button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface CommonProps {
  variant?: Variant;
  size?: Size;
  icon?: IconName;
  iconEnd?: IconName;
  loading?: boolean;
  block?: boolean;
  children?: ReactNode;
}

const classes = ({ variant = 'primary', size = 'md', block, loading }: CommonProps, extra?: string) =>
  clsx(styles.button, styles[variant], styles[size], block && styles.block, loading && styles.loading, extra);

const Content = ({ icon, iconEnd, children, size = 'md' }: CommonProps) => {
  const iconSize = size === 'sm' ? 16 : 18;
  return (
    <span className={styles.face}>
      {icon && <Icon name={icon} size={iconSize} />}
      {children}
      {iconEnd && <Icon name={iconEnd} size={iconSize} />}
    </span>
  );
};

/** Buttons look like keyboard keycaps and "press down" when clicked — the signature detail of the UI. */
export const Button = ({
  variant,
  size,
  icon,
  iconEnd,
  loading,
  block,
  className,
  children,
  disabled,
  type = 'button',
  ...rest
}: CommonProps & ComponentProps<'button'>) => (
  <button
    type={type}
    className={classes({ variant, size, block, loading }, className)}
    disabled={disabled ?? loading}
    aria-busy={loading || undefined}
    {...rest}
  >
    <Content icon={icon} iconEnd={iconEnd} size={size}>
      {children}
    </Content>
  </button>
);

export const ButtonLink = ({
  variant,
  size,
  icon,
  iconEnd,
  block,
  className,
  children,
  ...rest
}: CommonProps & LinkProps) => (
  <Link className={classes({ variant, size, block }, className)} {...rest}>
    <Content icon={icon} iconEnd={iconEnd} size={size}>
      {children}
    </Content>
  </Link>
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  badge?: number | undefined;
  active?: boolean;
}

export const IconButton = ({
  icon,
  label,
  badge,
  active,
  className,
  type = 'button',
  ...rest
}: IconButtonProps) => (
  <button
    type={type}
    className={clsx(styles.iconButton, active && styles.active, className)}
    aria-label={label}
    title={label}
    aria-pressed={active}
    {...rest}
  >
    <Icon name={icon} size={20} />
    {badge ? (
      <span className={styles.badge} aria-hidden="true">
        {badge > 99 ? '99+' : badge}
      </span>
    ) : null}
  </button>
);

interface IconLinkProps extends LinkProps {
  icon: IconName;
  label: string;
  badge?: number | undefined;
}

export const IconLink = ({ icon, label, badge, className, ...rest }: IconLinkProps) => (
  <Link className={clsx(styles.iconButton, className)} aria-label={label} title={label} {...rest}>
    <Icon name={icon} size={20} />
    {badge ? (
      <span className={styles.badge} aria-hidden="true">
        {badge > 99 ? '99+' : badge}
      </span>
    ) : null}
  </Link>
);

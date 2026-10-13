import {
  cloneElement,
  type InputHTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from 'react';
import clsx from 'clsx';

import styles from './field.module.css';

interface FieldProps {
  label: ReactNode;
  error?: string | undefined;
  hint?: ReactNode;
  children: ReactElement<{ id?: string; 'aria-invalid'?: boolean; 'aria-describedby'?: string }>;
  className?: string;
}

/** Wires label, hint and error to the control (aria-describedby / aria-invalid) automatically. */
export const Field = ({ label, error, hint, children, className }: FieldProps) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;
  return (
    <div className={clsx(styles.field, error && styles.invalid, className)}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {isValidElement(children)
        ? cloneElement(children, {
            id,
            'aria-invalid': error ? true : undefined,
            ...(describedBy ? { 'aria-describedby': describedBy } : {}),
          })
        : children}
      {hint && !error && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};

export const Input = ({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) => (
  <input className={clsx(styles.input, className)} {...rest} />
);

export const TextArea = ({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea className={clsx(styles.input, styles.textarea, className)} {...rest} />
);

interface CheckProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  count?: number | undefined;
  type?: 'checkbox' | 'radio';
}

export const Check = ({ label, count, className, type = 'checkbox', ...rest }: CheckProps) => (
  <label className={clsx(styles.check, rest.disabled && styles.disabled, className)}>
    <input type={type} className={styles.checkInput} {...rest} />
    <span className={styles.checkLabel}>{label}</span>
    {count !== undefined && <span className={styles.count}>{count}</span>}
  </label>
);

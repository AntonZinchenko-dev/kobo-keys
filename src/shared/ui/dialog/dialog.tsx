import { type ReactNode, useEffect, useId, useRef } from 'react';
import clsx from 'clsx';

import { IconButton } from '../button/button';

import styles from './dialog.module.css';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** center = modal window, right = side drawer, bottom = mobile sheet */
  placement?: 'center' | 'right' | 'bottom';
  size?: 'sm' | 'md' | 'lg';
  closeLabel?: string;
  className?: string;
}

/**
 * Native <dialog>: focus trap, Esc and inert background come from the browser.
 * Entry/exit animations use @starting-style + transition-behavior: allow-discrete (no JS timers).
 */
export const Dialog = ({
  open,
  onClose,
  title,
  children,
  footer,
  placement = 'center',
  size = 'md',
  closeLabel = 'Close',
  className,
}: DialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const startY = useRef<number | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  // Swipe down to close the bottom sheet on touch screens
  const onTouchStart = (e: React.TouchEvent) => {
    if (placement === 'bottom') startY.current = e.touches[0]?.clientY ?? null;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startY.current === null) return;
    const delta = (e.changedTouches[0]?.clientY ?? 0) - startY.current;
    startY.current = null;
    if (delta > 90) onClose();
  };

  return (
    // Backdrop click closes the dialog; keyboard users close it with Esc (native onCancel)
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={clsx(styles.dialog, styles[placement], styles[size], className)}
      aria-labelledby={titleId}
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.panel} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {placement === 'bottom' && <div className={styles.grabber} aria-hidden="true" />}
        <header className={styles.header}>
          <h2 id={titleId} className={styles.title}>
            {title}
          </h2>
          <IconButton icon="x" label={closeLabel} onClick={onClose} />
        </header>
        <div className={styles.body}>{children}</div>
        {footer && <footer className={styles.footer}>{footer}</footer>}
      </div>
    </dialog>
  );
};

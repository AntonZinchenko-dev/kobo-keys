import clsx from 'clsx';

import { Icon } from '../icon/icon';
import type { IconName } from '../icon/names';
import { type Tone, useToastStore } from './toast-store';

import styles from './toast.module.css';

const ICONS: Record<Tone, IconName> = { info: 'info', success: 'circle-check', error: 'triangle-alert' };

export const Toaster = ({ closeLabel }: { closeLabel: string }) => {
  const items = useToastStore((s) => s.items);
  const dismiss = useToastStore((s) => s.dismiss);
  return (
    // role=status + aria-live: screen readers announce cart updates and errors
    <ol className={styles.region} aria-live="polite" role="status">
      {items.map((t) => (
        <li key={t.id} className={clsx(styles.toast, styles[t.tone])}>
          <Icon name={ICONS[t.tone]} size={20} className={styles.icon} />
          <div className={styles.text}>
            <strong>{t.title}</strong>
            {t.description && <span>{t.description}</span>}
          </div>
          {t.action && (
            <button
              type="button"
              className={styles.action}
              onClick={() => {
                t.action?.onClick();
                dismiss(t.id);
              }}
            >
              {t.action.label}
            </button>
          )}
          <button
            type="button"
            className={styles.close}
            aria-label={closeLabel}
            onClick={() => dismiss(t.id)}
          >
            <Icon name="x" size={16} />
          </button>
        </li>
      ))}
    </ol>
  );
};

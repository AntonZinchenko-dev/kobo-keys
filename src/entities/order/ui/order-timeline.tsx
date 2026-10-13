import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import type { Order, OrderStatus } from '@/shared/api';
import { INTL_LOCALE, useLang } from '@/shared/i18n';
import { Icon, type IconName } from '@/shared/ui';

import styles from './order-timeline.module.css';

const STEPS: { status: OrderStatus; icon: IconName }[] = [
  { status: 'paid', icon: 'credit-card' },
  { status: 'processing', icon: 'package' },
  { status: 'shipped', icon: 'truck' },
  { status: 'delivered', icon: 'circle-check' },
];

export const OrderTimeline = ({ order }: { order: Order }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const reached = new Map(order.timeline.map((e) => [e.status, e.at]));
  const time = new Intl.DateTimeFormat(INTL_LOCALE[lang], { dateStyle: 'medium', timeStyle: 'short' });
  const currentIndex = STEPS.findLastIndex((s) => reached.has(s.status));

  return (
    <ol className={styles.timeline} aria-label={t('order.timeline')}>
      {STEPS.map((step, i) => {
        const at = reached.get(step.status);
        return (
          <li
            key={step.status}
            className={clsx(styles.step, at && styles.done, i === currentIndex && styles.current)}
            aria-current={i === currentIndex ? 'step' : undefined}
          >
            <span className={styles.dot}>
              <Icon name={step.icon} size={18} />
            </span>
            <span className={styles.label}>{t(`order.status.${step.status}`)}</span>
            <span className={styles.time}>{at ? time.format(new Date(at)) : '—'}</span>
          </li>
        );
      })}
    </ol>
  );
};

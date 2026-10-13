import { useTranslation } from 'react-i18next';

import type { Quote } from '@/shared/api';
import { Price } from '@/shared/ui';

import styles from './quote-totals.module.css';

/** Subtotal / discount / shipping / total exactly as the server calculated them. */
export const QuoteTotals = ({ quote }: { quote: Quote }) => {
  const { t } = useTranslation();
  return (
    <dl className={styles.totals}>
      <div>
        <dt>{t('summary.subtotal')}</dt>
        <dd>
          <Price value={quote.subtotal} />
        </dd>
      </div>
      {quote.discount > 0 && (
        <div className={styles.discount}>
          <dt>{t('summary.discount', { code: quote.promo?.code ?? '' })}</dt>
          <dd>
            −<Price value={quote.discount} />
          </dd>
        </div>
      )}
      <div>
        <dt>{t('summary.shipping')}</dt>
        <dd>{quote.shipping === 0 ? t('summary.free') : <Price value={quote.shipping} />}</dd>
      </div>
      <div className={styles.grand}>
        <dt>{t('summary.total')}</dt>
        <dd>
          <Price value={quote.total} size="lg" />
        </dd>
      </div>
    </dl>
  );
};

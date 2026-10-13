import { useTranslation } from 'react-i18next';

import { useCartStore } from '@/entities/cart';
import { Button, Dialog } from '@/shared/ui';

import styles from './checkout-page.module.css';

export interface Shortage {
  key: string;
  name: string;
  available: number;
}

/** Someone bought the last units while you were filling in the form: show what changed and fix the cart. */
export const StockConflictDialog = ({
  shortages,
  onClose,
  onFixed,
}: {
  shortages: Shortage[] | null;
  onClose: () => void;
  onFixed: () => void;
}) => {
  const { t } = useTranslation('checkout');
  const { t: tc } = useTranslation();
  const lines = useCartStore((s) => s.lines);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);

  const fix = () => {
    for (const s of shortages ?? []) {
      if (s.available === 0) remove(s.key);
      else setQty(s.key, s.available);
    }
    onFixed();
  };

  return (
    <Dialog
      open={shortages !== null}
      onClose={onClose}
      title={t('conflict.title')}
      size="sm"
      closeLabel={tc('actions.close')}
    >
      <div className={styles.conflict}>
        <p>{t('conflict.text')}</p>
        <ul>
          {(shortages ?? []).map((s) => (
            <li key={s.key}>
              <strong>{s.name}</strong>:{' '}
              {t('conflict.line', {
                wanted: lines.find((l) => l.key === s.key)?.qty ?? 0,
                available: s.available,
              })}
            </li>
          ))}
        </ul>
        <Button block onClick={fix}>
          {t('conflict.fix')}
        </Button>
      </div>
    </Dialog>
  );
};

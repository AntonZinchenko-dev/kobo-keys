import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { PaymentMethod } from '@/shared/api';
import { Button, Dialog, Icon, Price } from '@/shared/ui';

import styles from './checkout-page.module.css';

interface WalletDialogProps {
  open: boolean;
  method: PaymentMethod;
  total: number;
  onClose: () => void;
  onConfirm: () => void;
}

/** Imitation of the Apple Pay / Google Pay sheet: "biometric" scan, then confirmation. */
export const WalletDialog = ({ open, method, total, onClose, onConfirm }: WalletDialogProps) => {
  const { t } = useTranslation('checkout');
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!open) setScanning(false);
  }, [open]);

  const confirm = () => {
    setScanning(true);
    window.setTimeout(onConfirm, 1200);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t(`payment.methods.${method === 'card' ? 'apple_pay' : method}`)}
      size="sm"
      closeLabel={t('payment.cancel')}
    >
      <div className={styles.wallet}>
        <p>{t('payment.walletTitle')}</p>
        <Price value={total} size="lg" />
        <div className={styles.scan} data-scanning={scanning || undefined}>
          <Icon name={scanning ? 'circle-check' : 'user'} size={40} />
        </div>
        <Button block size="lg" loading={scanning} onClick={confirm}>
          {t('payment.walletConfirm')}
        </Button>
        <p className={styles.hint}>{t('payment.walletDemo')}</p>
      </div>
    </Dialog>
  );
};

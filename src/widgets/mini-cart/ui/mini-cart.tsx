import { useTranslation } from 'react-i18next';

import { EditableCartLines } from '@/features/edit-cart';
import { selectCount, useCartQuote, useCartStore } from '@/entities/cart';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { ButtonLink, Dialog, EmptyState, Price } from '@/shared/ui';

import { FreeShippingProgress } from './free-shipping-progress';

import styles from './mini-cart.module.css';

export const MiniCart = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { t } = useTranslation();
  const lang = useLang();
  const count = useCartStore(selectCount);
  const { quote, lines } = useCartQuote();
  const subtotal = quote.data?.subtotal ?? lines.reduce((s, l) => s + l.snapshot.unitPrice * l.qty, 0);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      placement="right"
      title={t('cart.title', { count })}
      closeLabel={t('actions.close')}
      footer={
        lines.length > 0 ? (
          <div className={styles.footer}>
            <div className={styles.total}>
              <span>{t('cart.subtotal')}</span>
              <Price value={subtotal} size="lg" />
            </div>
            <div className={styles.buttons}>
              <ButtonLink to={paths.cart(lang)} variant="secondary" onClick={onClose} block>
                {t('cart.viewCart')}
              </ButtonLink>
              <ButtonLink to={paths.checkout(lang)} onClick={onClose} block iconEnd="arrow-right">
                {t('cart.checkout')}
              </ButtonLink>
            </div>
          </div>
        ) : undefined
      }
    >
      {lines.length === 0 ? (
        <EmptyState
          compact
          mascot="empty-cart"
          title={t('cart.empty')}
          text={t('cart.emptyText')}
          action={
            <ButtonLink to={paths.catalog(lang)} onClick={onClose}>
              {t('cart.toCatalog')}
            </ButtonLink>
          }
        />
      ) : (
        <>
          <FreeShippingProgress subtotal={subtotal} threshold={quote.data?.freeShippingThreshold ?? 15000} />
          <EditableCartLines compact />
        </>
      )}
    </Dialog>
  );
};

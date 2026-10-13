import { useEffect, useRef, useState } from 'react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import clsx from 'clsx';

import { PromoForm } from '@/features/apply-promo';
import { QuoteTotals, toLineInputs, useCartQuote, useCartStore } from '@/entities/cart';
import { useSessionStore } from '@/entities/session';
import { api, type CheckoutRequest, isApiError, type Order, type PaymentResponse } from '@/shared/api';
import { paths } from '@/shared/config';
import { useLang } from '@/shared/i18n';
import { Button, ButtonLink, EmptyState, Icon, Picture, Price, Skeleton, toast } from '@/shared/ui';

import { digits } from '../lib/card';
import { type CheckoutForm, checkoutSchema, EMPTY_FORM, STEP_FIELDS } from '../model/schema';
import { ContactStep } from './contact-step';
import { DeliveryStep } from './delivery-step';
import { PaymentStep } from './payment-step';
import { type Shortage, StockConflictDialog } from './stock-conflict-dialog';
import { WalletDialog } from './wallet-dialog';

import styles from './checkout-page.module.css';

const DRAFT_KEY = 'kobo-checkout-draft';
type Step = 1 | 2 | 3;

/** Card data is never written to storage — only contact and delivery details. */
const readDraft = (): Partial<CheckoutForm> => {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY) ?? '{}') as Partial<CheckoutForm>;
  } catch {
    return {};
  }
};

export const CheckoutPage = () => {
  const { t } = useTranslation('checkout');
  const { t: tc } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const user = useSessionStore((s) => s.user);
  const { lines, quote, promo } = useCartQuote();
  const setShipping = useCartStore((s) => s.setShipping);
  const clearCart = useCartStore((s) => s.clear);
  const [step, setStep] = useState<Step>(1);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [shortages, setShortages] = useState<Shortage[] | null>(null);
  const [walletOpen, setWalletOpen] = useState(false);
  const pendingOrder = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const methods = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    mode: 'onTouched',
    defaultValues: {
      ...EMPTY_FORM,
      email: user?.email ?? '',
      name: user?.name ?? '',
      city: user?.addresses[0]?.city ?? '',
      street: user?.addresses[0]?.street ?? '',
      zip: user?.addresses[0]?.zip ?? '',
      ...readDraft(),
    },
  });
  const shipping = useWatch({ control: methods.control, name: 'shipping' });
  const values = useWatch({ control: methods.control });

  // Persist contact/delivery draft; sync the delivery method into the cart quote
  useEffect(() => {
    const { cardNumber: _n, cardCvc: _c, cardExp: _e, cardName: _m, ...safe } = values;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(safe));
    } catch {
      // storage blocked — the draft simply isn't kept
    }
  }, [values]);
  useEffect(() => setShipping(shipping), [shipping, setShipping]);

  const pay = useMutation({
    mutationFn: async (form: CheckoutForm) => {
      if (!pendingOrder.current) {
        const body: CheckoutRequest = {
          lines: toLineInputs(lines),
          ...(promo ? { promo } : {}),
          shipping: form.shipping,
          contact: { email: form.email, name: form.name, phone: form.phone },
          ...(form.shipping === 'workshop'
            ? {}
            : { address: { country: 'PL', city: form.city, street: form.street, zip: form.zip } }),
          ...(form.comment ? { comment: form.comment } : {}),
        };
        const order = await api<Order>('/checkout', { method: 'POST', body });
        pendingOrder.current = order.id;
      }
      return api<PaymentResponse>('/payments', {
        method: 'POST',
        // A fresh key per attempt; a double click inside one attempt can never charge twice.
        headers: { 'Idempotency-Key': crypto.randomUUID() },
        body: {
          orderId: pendingOrder.current,
          method: form.method,
          ...(form.method === 'card'
            ? {
                card: {
                  number: digits(form.cardNumber),
                  exp: form.cardExp,
                  cvc: form.cardCvc,
                  name: form.cardName,
                },
              }
            : {}),
        },
      });
    },
    onMutate: () => setPaymentError(null),
    onSuccess: (result) => {
      sessionStorage.removeItem(DRAFT_KEY);
      if (result.status === 'requires_action') {
        void navigate(paths.threeDs(lang, result.paymentId));
        return;
      }
      clearCart();
      void navigate(`${paths.order(lang, result.orderId)}?new=1`, { viewTransition: true });
    },
    onError: (error) => {
      if (isApiError(error) && error.code === 'OUT_OF_STOCK') {
        setShortages(error.details as Shortage[]);
        return;
      }
      const known = ['CARD_DECLINED', 'INSUFFICIENT_FUNDS', 'PAYMENT_GATEWAY_DOWN', 'NETWORK_ERROR'];
      const code = isApiError(error) && known.includes(error.code) ? error.code : 'GENERIC';
      setPaymentError(t(`payment.errors.${code as 'GENERIC'}`));
      if (code === 'PAYMENT_GATEWAY_DOWN' || code === 'GENERIC')
        toast.error(t(`payment.errors.${code as 'GENERIC'}`));
    },
  });

  const goTo = async (next: Step) => {
    if (next > step) {
      const valid = await methods.trigger(STEP_FIELDS[step]);
      if (!valid) return;
    } else {
      // Details may change — a new order will be created on the next payment attempt
      pendingOrder.current = null;
    }
    setStep(next);
    headingRef.current?.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = methods.handleSubmit(
    (form) => {
      if (form.method === 'card') pay.mutate(form);
      else setWalletOpen(true);
    },
    () => {
      // Validation failed: jump to the first step that has an error
      const errors = methods.formState.errors;
      const bad = ([1, 2, 3] as const).find((s) => STEP_FIELDS[s].some((f) => errors[f]));
      if (bad && bad !== step) setStep(bad);
    },
  );

  if (lines.length === 0 && !pay.isPending && !pay.isSuccess) {
    return (
      <div className="container">
        <EmptyState
          mascot="empty-cart"
          title={tc('cart.empty')}
          text={t('checkout.emptyText')}
          action={<ButtonLink to={paths.catalog(lang)}>{tc('cart.toCatalog')}</ButtonLink>}
        />
      </div>
    );
  }

  const steps: { n: Step; label: string }[] = [
    { n: 1, label: t('steps.contact') },
    { n: 2, label: t('steps.delivery') },
    { n: 3, label: t('steps.payment') },
  ];

  return (
    <div className={`container ${styles.page}`}>
      <title>{`${t('checkout.title')} — KŌBŌ Keys`}</title>

      <Link to={paths.cart(lang)} className={styles.back}>
        <Icon name="arrow-left" size={16} /> {t('checkout.backToCart')}
      </Link>
      <h1 ref={headingRef} tabIndex={-1} className={styles.title}>
        {t('checkout.title')}
      </h1>

      <ol className={styles.stepper} aria-label={t('steps.label')}>
        {steps.map((s) => (
          <li
            key={s.n}
            className={clsx(styles.stepItem, s.n === step && styles.current, s.n < step && styles.done)}
          >
            <button
              type="button"
              onClick={() => void goTo(s.n)}
              disabled={s.n > step}
              aria-current={s.n === step ? 'step' : undefined}
            >
              <span className={styles.stepNum}>{s.n < step ? <Icon name="check" size={14} /> : s.n}</span>
              {s.label}
            </button>
          </li>
        ))}
      </ol>

      <div className={styles.layout}>
        <FormProvider {...methods}>
          <form className={styles.form} onSubmit={(e) => void submit(e)} noValidate>
            {step === 1 && <ContactStep />}
            {step === 2 && <DeliveryStep />}
            {step === 3 && <PaymentStep error={paymentError} />}

            <div className={styles.nav}>
              {step > 1 && (
                <Button variant="ghost" icon="arrow-left" onClick={() => void goTo((step - 1) as Step)}>
                  {tc('actions.back')}
                </Button>
              )}
              {step < 3 ? (
                <Button
                  iconEnd="arrow-right"
                  onClick={() => void goTo((step + 1) as Step)}
                  className={styles.next}
                >
                  {t('steps.next')}
                </Button>
              ) : (
                <Button type="submit" size="lg" icon="lock" loading={pay.isPending} className={styles.next}>
                  {t('payment.pay')}
                  {quote.data && <Price value={quote.data.total} />}
                </Button>
              )}
            </div>
          </form>
        </FormProvider>

        <aside className={styles.summary} aria-label={t('summary.title')}>
          <h2>{t('summary.title')}</h2>
          <ul className={styles.lines}>
            {lines.map((l) => (
              <li key={l.key}>
                <div className={styles.lineThumb}>
                  {l.snapshot.image ? (
                    <Picture slot={l.snapshot.image} alt="" ratio={1} sizes="56px" />
                  ) : (
                    <Icon name="keyboard" size={24} />
                  )}
                  <span className={styles.lineQty}>{l.qty}</span>
                </div>
                <div className={styles.lineInfo}>
                  <strong>{l.snapshot.name}</strong>
                  <span>{l.snapshot.variantLabel}</span>
                </div>
                <Price
                  value={
                    (quote.data?.lines.find((q) => q.key === l.key)?.unitPrice ?? l.snapshot.unitPrice) *
                    l.qty
                  }
                  size="sm"
                />
              </li>
            ))}
          </ul>
          <PromoForm />
          {quote.data ? <QuoteTotals quote={quote.data} /> : <Skeleton style={{ height: 120 }} />}
          <p className={styles.secure}>
            <Icon name="shield-check" size={16} /> {t('summary.demo')}
          </p>
        </aside>
      </div>

      <WalletDialog
        open={walletOpen}
        method={methods.getValues('method')}
        total={quote.data?.total ?? 0}
        onClose={() => setWalletOpen(false)}
        onConfirm={() => {
          setWalletOpen(false);
          pay.mutate(methods.getValues());
        }}
      />
      <StockConflictDialog
        shortages={shortages}
        onClose={() => setShortages(null)}
        onFixed={() => {
          pendingOrder.current = null;
          setShortages(null);
        }}
      />
    </div>
  );
};

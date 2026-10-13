import { z } from 'zod';

import { cardBrand, digits, isExpiryValid, luhn } from '../lib/card';

/** Error messages are i18n keys from the "checkout" namespace (errors.*). */
export const checkoutSchema = z
  .object({
    email: z.string().trim().email('errors.email'),
    name: z.string().trim().min(2, 'errors.name'),
    phone: z.string().refine((v) => digits(v).length >= 9, 'errors.phone'),
    shipping: z.enum(['courier', 'pickup', 'workshop']),
    city: z.string().trim(),
    street: z.string().trim(),
    zip: z.string().trim(),
    comment: z.string().max(300, 'errors.comment').optional(),
    method: z.enum(['card', 'apple_pay', 'google_pay']),
    cardNumber: z.string(),
    cardExp: z.string(),
    cardCvc: z.string(),
    cardName: z.string(),
  })
  .superRefine((v, ctx) => {
    if (v.shipping !== 'workshop') {
      if (v.city.length < 2) ctx.addIssue({ code: 'custom', path: ['city'], message: 'errors.city' });
      if (v.street.length < 3) ctx.addIssue({ code: 'custom', path: ['street'], message: 'errors.street' });
      if (!/^[\d-\s]{4,10}$/.test(v.zip))
        ctx.addIssue({ code: 'custom', path: ['zip'], message: 'errors.zip' });
    }
    if (v.method === 'card') {
      if (!luhn(v.cardNumber))
        ctx.addIssue({ code: 'custom', path: ['cardNumber'], message: 'errors.cardNumber' });
      if (!isExpiryValid(v.cardExp))
        ctx.addIssue({ code: 'custom', path: ['cardExp'], message: 'errors.cardExp' });
      const cvcLength = cardBrand(v.cardNumber) === 'amex' ? 4 : 3;
      if (digits(v.cardCvc).length !== cvcLength)
        ctx.addIssue({ code: 'custom', path: ['cardCvc'], message: 'errors.cardCvc' });
      if (v.cardName.trim().length < 2)
        ctx.addIssue({ code: 'custom', path: ['cardName'], message: 'errors.cardName' });
    }
  });

export type CheckoutForm = z.infer<typeof checkoutSchema>;

export const STEP_FIELDS: Record<1 | 2 | 3, (keyof CheckoutForm)[]> = {
  1: ['email', 'name', 'phone'],
  2: ['shipping', 'city', 'street', 'zip', 'comment'],
  3: ['method', 'cardNumber', 'cardExp', 'cardCvc', 'cardName'],
};

export const EMPTY_FORM: CheckoutForm = {
  email: '',
  name: '',
  phone: '',
  shipping: 'courier',
  city: '',
  street: '',
  zip: '',
  comment: '',
  method: 'card',
  cardNumber: '',
  cardExp: '',
  cardCvc: '',
  cardName: '',
};

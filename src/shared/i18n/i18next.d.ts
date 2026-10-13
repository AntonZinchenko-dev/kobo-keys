import type account from './locales/ru/account.json';
import type builder from './locales/ru/builder.json';
import type checkout from './locales/ru/checkout.json';
import type common from './locales/ru/common.json';
import type home from './locales/ru/home.json';
import type shop from './locales/ru/shop.json';

import 'i18next';

/**
 * Translation keys are typed from the Russian locale: a typo in a key is a compile error.
 * Key parity of en/pl with ru is checked by locales.test.ts.
 */
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      home: typeof home;
      shop: typeof shop;
      checkout: typeof checkout;
      account: typeof account;
      builder: typeof builder;
    };
    returnNull: false;
  }
}

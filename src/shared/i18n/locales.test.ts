import { IntlMessageFormat } from 'intl-messageformat';

import { LANGS } from '@/shared/api';

import { INTL_LOCALE, NAMESPACES } from './config';

type Tree = { [key: string]: string | Tree };

const files = import.meta.glob<Tree>('./locales/*/*.json', { eager: true, import: 'default' });
const load = (lang: string, ns: string) => files[`./locales/${lang}/${ns}.json`] ?? {};

const flatten = (tree: Tree, prefix = ''): Record<string, string> =>
  Object.entries(tree).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});

describe('locales', () => {
  for (const ns of NAMESPACES) {
    const reference = Object.keys(flatten(load('ru', ns))).sort();

    it(`"${ns}" exists for every language`, () => {
      for (const lang of LANGS) expect(Object.keys(load(lang, ns)).length).toBeGreaterThan(0);
    });

    for (const lang of LANGS.filter((l) => l !== 'ru')) {
      it(`${lang}/${ns} has exactly the same keys as ru/${ns}`, () => {
        expect(Object.keys(flatten(load(lang, ns))).sort()).toEqual(reference);
      });
    }

    for (const lang of LANGS) {
      it(`${lang}/${ns}: every message is valid ICU`, () => {
        for (const [key, message] of Object.entries(flatten(load(lang, ns)))) {
          expect(
            () => new IntlMessageFormat(message, INTL_LOCALE[lang]),
            `${lang}/${ns}:${key}`,
          ).not.toThrow();
        }
      });
    }
  }

  it('uses correct plural forms (ru: 1 товар / 3 товара / 5 товаров)', () => {
    const items = flatten(load('ru', 'common'))['cart.items'] ?? '';
    const format = (count: number) => new IntlMessageFormat(items, 'ru-RU').format({ count });
    expect(format(1)).toBe('1 товар');
    expect(format(3)).toBe('3 товара');
    expect(format(5)).toBe('5 товаров');
    expect(format(21)).toBe('21 товар');
  });

  it('uses correct plural forms (pl: 1 produkt / 2 produkty / 5 produktów)', () => {
    const items = flatten(load('pl', 'common'))['cart.items'] ?? '';
    const format = (count: number) => new IntlMessageFormat(items, 'pl-PL').format({ count });
    expect(format(1)).toBe('1 produkt');
    expect(format(2)).toBe('2 produkty');
    expect(format(5)).toBe('5 produktów');
    expect(format(22)).toBe('22 produkty');
  });
});

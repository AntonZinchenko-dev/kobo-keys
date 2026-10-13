import { convert, FALLBACK_RATES, formatMoney } from './money';

const clean = (s: string) => s.replace(/\s/g, ' ');

describe('money', () => {
  it('keeps EUR cents as they are and rounds converted prices to whole units', () => {
    expect(convert(18900, 'EUR', FALLBACK_RATES)).toBe(18900);
    expect(convert(18900, 'PLN', FALLBACK_RATES)).toBe(80700); // 189 € × 4.27 ≈ 807 zł
    expect(convert(18900, 'USD', FALLBACK_RATES)).toBe(20600);
  });

  it('formats per locale and currency', () => {
    expect(clean(formatMoney(18900, 'EUR', 'en'))).toBe('€189');
    expect(clean(formatMoney(18950, 'EUR', 'en'))).toBe('€189.50');
    expect(clean(formatMoney(18900, 'EUR', 'ru'))).toBe('189 €');
    expect(clean(formatMoney(18900, 'PLN', 'pl'))).toBe('807 zł');
  });
});

import { cardBrand, formatCardNumber, formatExpiry, formatPhone, isExpiryValid, luhn } from './card';

describe('card helpers', () => {
  it('detects the brand from the first digits', () => {
    expect(cardBrand('4242')).toBe('visa');
    expect(cardBrand('5555 5555')).toBe('mastercard');
    expect(cardBrand('2221 00')).toBe('mastercard');
    expect(cardBrand('3782')).toBe('amex');
    expect(cardBrand('6011')).toBe('unknown');
  });

  it('validates numbers with the Luhn checksum', () => {
    expect(luhn('4242 4242 4242 4242')).toBe(true);
    expect(luhn('4000 0027 6000 3184')).toBe(true);
    expect(luhn('4242 4242 4242 4241')).toBe(false);
    expect(luhn('1234')).toBe(false);
  });

  it('formats card numbers in groups (Amex 4-6-5)', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('424242424242424299')).toBe('4242 4242 4242 4242');
    expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
  });

  it('formats and validates the expiry date', () => {
    expect(formatExpiry('1228')).toBe('12/28');
    expect(formatExpiry('1')).toBe('1');
    const now = new Date('2026-10-13');
    expect(isExpiryValid('10/26', now)).toBe(true);
    expect(isExpiryValid('09/26', now)).toBe(false);
    expect(isExpiryValid('13/30', now)).toBe(false);
    expect(isExpiryValid('1230', now)).toBe(false);
  });

  it('masks phone numbers', () => {
    expect(formatPhone('48123456789')).toBe('+48 123 456 789');
    expect(formatPhone('+7 9161234567')).toBe('+7 916 123 45 67');
    expect(formatPhone('380501234567')).toBe('+380 501 234 567');
    expect(formatPhone('')).toBe('');
  });
});

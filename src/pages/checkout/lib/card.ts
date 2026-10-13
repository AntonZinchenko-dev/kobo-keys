/** Card helpers: brand detection, Luhn check and input formatting. Pure functions — covered by unit tests. */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'unknown';

export const digits = (value: string) => value.replace(/\D/g, '');

export const cardBrand = (value: string): CardBrand => {
  const d = digits(value);
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  return 'unknown';
};

/** Luhn checksum — catches most typos in a card number before it reaches the gateway. */
export const luhn = (value: string) => {
  const d = digits(value);
  if (d.length < 12) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = Number(d[d.length - 1 - i]);
    if (i % 2 === 1) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
  }
  return sum % 10 === 0;
};

/** "4242424242424242" → "4242 4242 4242 4242"; Amex is grouped 4-6-5. */
export const formatCardNumber = (value: string) => {
  const d = digits(value).slice(0, cardBrand(value) === 'amex' ? 15 : 16);
  if (cardBrand(d) === 'amex') return [d.slice(0, 4), d.slice(4, 10), d.slice(10)].filter(Boolean).join(' ');
  return d.replace(/(.{4})/g, '$1 ').trim();
};

export const formatExpiry = (value: string) => {
  const d = digits(value).slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
};

export const isExpiryValid = (value: string, now = new Date()) => {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return false;
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return false;
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= now;
};

/** Light phone mask: "+48123456789" → "+48 123 456 789", "+79161234567" → "+7 916 123 45 67" */
const THREE_DIGIT_CODES = ['380', '375', '370', '371', '372', '373', '374'];
const GROUPS: Record<string, number[]> = {
  '7': [3, 3, 2, 2],
  '48': [3, 3, 3],
  '49': [3, 4, 4],
  '1': [3, 3, 4],
};

export const formatPhone = (value: string) => {
  const d = digits(value).slice(0, 15);
  if (!d) return value.startsWith('+') ? '+' : '';
  const codeLength = THREE_DIGIT_CODES.some((c) => d.startsWith(c))
    ? 3
    : d.startsWith('7') || d.startsWith('1')
      ? 1
      : 2;
  const code = d.slice(0, codeLength);
  let rest = d.slice(codeLength);
  const parts: string[] = [];
  for (const size of GROUPS[code] ?? [3, 3, 3, 3]) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  if (rest) parts.push(rest);
  return [`+${code}`, ...parts].join(' ');
};

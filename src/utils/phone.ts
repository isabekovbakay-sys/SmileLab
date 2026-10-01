/**
 * Телефоны Кыргызстана (+996). Храним в E.164 (+996555123456), показываем +996 555 123 456.
 * Национальная часть — 9 цифр, первая не 0 и не 1.
 */
export const KG_COUNTRY_CODE = '996';
export const KG_NATIONAL_LENGTH = 9;

export type PhoneValidation = 'ok' | 'empty' | 'incomplete' | 'invalidPrefix';

/**
 * Принимает любую вставку и возвращает национальные цифры (до 9):
 * «+996 555 12-34-56», «996555123456», «0555123456», «00996…», «555123456».
 */
export function normalizeKgPhone(input: string): string {
  const trimmed = input.trim();
  let digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) {
    if (digits.startsWith(KG_COUNTRY_CODE)) digits = digits.slice(KG_COUNTRY_CODE.length);
  } else if (digits.startsWith('00' + KG_COUNTRY_CODE)) {
    digits = digits.slice(2 + KG_COUNTRY_CODE.length);
  } else if (digits.startsWith(KG_COUNTRY_CODE) && digits.length >= KG_COUNTRY_CODE.length + KG_NATIONAL_LENGTH) {
    digits = digits.slice(KG_COUNTRY_CODE.length);
  }
  if (digits.startsWith('0')) digits = digits.replace(/^0+/, '');
  return digits.slice(0, KG_NATIONAL_LENGTH);
}

export function validateKgPhone(national: string): PhoneValidation {
  if (national.length === 0) return 'empty';
  if (national[0] === '0' || national[0] === '1') return 'invalidPrefix';
  if (national.length < KG_NATIONAL_LENGTH) return 'incomplete';
  return 'ok';
}

/** «555123456» → «555 123 456» (частичный ввод тоже форматируется). */
export function formatNationalPhone(national: string): string {
  const d = national.replace(/\D/g, '').slice(0, KG_NATIONAL_LENGTH);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6, 9)].filter(Boolean).join(' ');
}

export function toE164(national: string): string {
  return `+${KG_COUNTRY_CODE}${national}`;
}

/** E.164 или любая запись → национальные цифры. */
export function nationalFromAny(phone: string): string {
  return normalizeKgPhone(phone);
}

/** «+996555123456» → «+996 555 123 456». */
export function formatInternationalPhone(phone: string): string {
  const national = normalizeKgPhone(phone);
  return `+${KG_COUNTRY_CODE} ${formatNationalPhone(national)}`.trim();
}

/** Только цифры с кодом страны: для wa.me. */
export function phoneDigits(phone: string): string {
  return `${KG_COUNTRY_CODE}${normalizeKgPhone(phone)}`;
}

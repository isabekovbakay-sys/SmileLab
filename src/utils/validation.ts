import { validateKgPhone, type PhoneValidation } from './phone';

export type NameValidation = 'ok' | 'empty' | 'tooShort';
export type EmailValidation = 'ok' | 'empty' | 'invalid';

export function validateName(name: string): NameValidation {
  const trimmed = name.trim();
  if (!trimmed) return 'empty';
  if (trimmed.length < 2) return 'tooShort';
  return 'ok';
}

export function validateEmail(email: string): EmailValidation {
  const trimmed = email.trim();
  if (!trimmed) return 'empty';
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed) ? 'ok' : 'invalid';
}

export function validatePhone(national: string): PhoneValidation {
  return validateKgPhone(national);
}

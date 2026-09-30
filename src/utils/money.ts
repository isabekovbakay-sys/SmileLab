/** Неразрывный пробел: сумма и «сом» не разрываются переносом строки. */
export const NBSP = ' ';

/** 38000 → «38 000» (разряды через неразрывный пробел). */
export function formatAmount(amount: number): string {
  const rounded = Math.round(amount);
  const sign = rounded < 0 ? '-' : '';
  const digits = String(Math.abs(rounded));
  const groups: string[] = [];
  for (let i = digits.length; i > 0; i -= 3) {
    groups.unshift(digits.slice(Math.max(0, i - 3), i));
  }
  return sign + groups.join(NBSP);
}

/** 38000 → «38 000 сом». Валюта приложения — только сом. */
export function formatMoney(amount: number): string {
  return `${formatAmount(amount)}${NBSP}сом`;
}

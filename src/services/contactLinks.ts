import { cities } from '../data/cities';
import type { Address, Branch, LocalizedText } from '../types/domain';
import { normalizeKgPhone, phoneDigits, toE164 } from '../utils/phone';

/** Ссылки для связи с клиникой. Чистые функции — проверяются тестами. */

type Localize = (text: LocalizedText) => string;

export interface TelegramContact {
  username: string | null;
  phone: string | null;
}

export function hasPhone(phone: string | null | undefined): boolean {
  return normalizeKgPhone(phone ?? '').length === 9;
}

export function hasTelegram(telegram: TelegramContact): boolean {
  return Boolean(telegram.username?.replace(/^@/, '').trim()) || hasPhone(telegram.phone);
}

export function hasEmail(email: string | null | undefined): boolean {
  return Boolean(email?.trim());
}

export function telUrl(phone: string): string {
  return `tel:${toE164(normalizeKgPhone(phone))}`;
}

export function whatsappUrl(phone: string, text?: string): string {
  const base = `https://wa.me/${phoneDigits(phone)}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/**
 * Telegram: по @username ссылка работает всегда и принимает готовый текст.
 * По номеру (t.me/+996…) — только если владелец разрешил находить его по номеру; текст не подставляется.
 */
export function telegramUrl(telegram: TelegramContact, text?: string): string | null {
  const username = telegram.username?.replace(/^@/, '').trim();
  if (username) {
    const base = `https://t.me/${username}`;
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
  }
  return hasPhone(telegram.phone) ? `https://t.me/+${phoneDigits(telegram.phone ?? '')}` : null;
}

export function mailtoUrl(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

/** Есть улица и дом — по адресу можно искать на картах. */
export function hasStreetAddress(address: Address): boolean {
  return Boolean(address.street && address.building?.trim());
}

/** «Бишкек, ул. Токтогула, 100» — только реальные части адреса. */
export function fullAddress(address: Address, localize: Localize): string {
  return [
    localize(cities[address.cityId].name),
    address.street ? localize(address.street) : null,
    address.building?.trim() || null,
  ]
    .filter(Boolean)
    .join(', ');
}

/** 2ГИС: прямая ссылка на карточку или поиск по полному адресу. null — кнопку прячем. */
export function twoGisLink(branch: Branch, localize: Localize): string | null {
  if (branch.twoGisUrl) return branch.twoGisUrl;
  if (!hasStreetAddress(branch.address)) return null;
  const slug = cities[branch.address.cityId].twoGisSlug;
  const q = encodeURIComponent(fullAddress(branch.address, localize));
  return slug ? `https://2gis.kg/${slug}/search/${q}` : `https://2gis.kg/search/${q}`;
}

/**
 * Карта: по координатам (на Android — geo: с подписью), иначе поиск по полному адресу.
 * null — ни координат, ни адреса: кнопку прячем.
 */
export function mapLink(
  branch: Branch,
  clinicName: string,
  localize: Localize,
  platform: 'android' | 'other',
): { url: string; fallback: string } | null {
  const { coordinates, address } = branch;
  if (coordinates) {
    const { lat, lng } = coordinates;
    const web = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    return {
      url: platform === 'android' ? `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(clinicName)})` : web,
      fallback: web,
    };
  }
  if (!hasStreetAddress(address)) return null;
  const query = encodeURIComponent(fullAddress(address, localize));
  const web = `https://www.google.com/maps/search/?api=1&query=${query}`;
  return { url: platform === 'android' ? `geo:0,0?q=${query}` : web, fallback: web };
}

import { cities } from '../data/cities';
import type { Address, Coordinates } from '../types/domain';
import { phoneDigits, toE164, normalizeKgPhone } from '../utils/phone';

/** Ссылки для связи с клиникой. Чистые функции — проверяются тестами. */

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
export function telegramUrl(telegram: { username: string | null; phone: string }, text?: string): string {
  if (telegram.username) {
    const base = `https://t.me/${telegram.username.replace(/^@/, '')}`;
    return text ? `${base}?text=${encodeURIComponent(text)}` : base;
  }
  return `https://t.me/+${phoneDigits(telegram.phone)}`;
}

export function telegramSupportsText(telegram: { username: string | null }): boolean {
  return Boolean(telegram.username);
}

export function mailtoUrl(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  return query ? `mailto:${email}?${query}` : `mailto:${email}`;
}

/** Поисковая строка для карт: «SmileLab, Бишкек, ул. …». */
export function mapQuery(clinicName: string, address: Address, localize: (t: { ru: string; ky: string }) => string): string {
  const city = cities[address.cityId];
  return [clinicName, localize(city.name), address.street ? localize(address.street) : null, address.building]
    .filter(Boolean)
    .join(', ');
}

export function twoGisUrl(address: Address, query: string): string {
  const slug = cities[address.cityId].twoGisSlug;
  const q = encodeURIComponent(query);
  return slug ? `https://2gis.kg/${slug}/search/${q}` : `https://2gis.kg/search/${q}`;
}

/** geo: для Android — открывает выбор карты. Без координат — поиск по названию. */
export function geoUrl(query: string, coordinates: Coordinates | null): string {
  if (coordinates) {
    const { lat, lng } = coordinates;
    return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(query)})`;
  }
  return `geo:0,0?q=${encodeURIComponent(query)}`;
}

/** Запасная ссылка на карты в браузере (web и iOS). */
export function webMapUrl(query: string, coordinates: Coordinates | null): string {
  const q = coordinates ? `${coordinates.lat},${coordinates.lng}` : query;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}

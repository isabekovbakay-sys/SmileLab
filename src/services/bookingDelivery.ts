import { appConfig } from '../config/app';
import { clinicConfig, type RequestChannel } from '../config/clinic';
import { openExternal } from './contact';
import { telegramUrl, whatsappUrl } from './contactLinks';

/**
 * Куда уходит заявка:
 * - api — на сервер клиники;
 * - whatsapp / telegram — сервера нет: запись сохраняется на телефоне,
 *   и открывается мессенджер клиники с готовым текстом;
 * - demo — никуда: честная плашка «Демо» и ручная кнопка «Отправить в WhatsApp».
 */
export type DeliveryMode = 'api' | RequestChannel | 'demo';

export function getDeliveryMode(): DeliveryMode {
  if (appConfig.dataSource === 'api' && appConfig.apiBaseUrl) return 'api';
  if (clinicConfig.isDemo) return 'demo';
  return clinicConfig.booking.requestChannel;
}

/** Мессенджер для заявок (для demo — для ручной отправки). */
export function requestChannel(): RequestChannel {
  return clinicConfig.booking.requestChannel;
}

export function channelTitle(channel: RequestChannel): string {
  return channel === 'whatsapp' ? 'WhatsApp' : 'Telegram';
}

export function messengerUrl(channel: RequestChannel, text: string): string {
  return channel === 'whatsapp'
    ? whatsappUrl(clinicConfig.contacts.whatsapp, text)
    : telegramUrl(clinicConfig.contacts.telegram, text);
}

/** Открывает мессенджер клиники с текстом. false — ни одно приложение не открылось. */
export function sendToMessenger(channel: RequestChannel, text: string): Promise<boolean> {
  return openExternal(messengerUrl(channel, text));
}

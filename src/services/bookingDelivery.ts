import { appConfig } from '../config/app';
import { clinicConfig, type RequestChannel } from '../config/clinic';
import { openExternal } from './contact';
import type { ScheduleMode } from './mock/availability';
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

/**
 * Как выбирается время:
 * - slots — «свободное время» (сервер знает расписание; в демо — имитация);
 * - request — «желаемое время»: без сервера реального расписания нет, клиника подтвердит в мессенджере.
 */
export function getScheduleMode(): ScheduleMode {
  const mode = getDeliveryMode();
  return mode === 'api' || mode === 'demo' ? 'slots' : 'request';
}

/** Мессенджер для заявок (для demo — для ручной отправки). */
export function requestChannel(): RequestChannel {
  return clinicConfig.booking.requestChannel;
}

export function channelTitle(channel: RequestChannel): string {
  return channel === 'whatsapp' ? 'WhatsApp' : 'Telegram';
}

export function messengerUrl(channel: RequestChannel, text: string): string | null {
  return channel === 'whatsapp'
    ? whatsappUrl(clinicConfig.contacts.whatsapp, text)
    : telegramUrl(clinicConfig.contacts.telegram, text);
}

/** Открывает мессенджер клиники с текстом. false — контакт не задан или ни одно приложение не открылось. */
export async function sendToMessenger(channel: RequestChannel, text: string): Promise<boolean> {
  const url = messengerUrl(channel, text);
  return url ? openExternal(url) : false;
}

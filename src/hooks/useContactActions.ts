import { Platform } from 'react-native';

import { clinicConfig, getBranch } from '../config/clinic';
import { useI18n } from '../i18n';
import { track } from '../services/analytics';
import { openExternal } from '../services/contact';
import {
  hasEmail,
  hasPhone,
  hasTelegram,
  mailtoUrl,
  mapLink,
  telegramUrl,
  telUrl,
  twoGisLink,
  whatsappUrl,
} from '../services/contactLinks';
import { useToast } from '../state/ToastProvider';
import { hapticImpact } from '../utils/haptics';
import { formatInternationalPhone } from '../utils/phone';

/**
 * Связь с клиникой: звонок, WhatsApp, Telegram, почта, карта, 2ГИС.
 * Флаги available.* говорят, что задано в config/clinic.ts: незаданное экраны прячут.
 * Если ни одно приложение не открыло ссылку — тост с контактом.
 */
export function useContactActions() {
  const { t, l } = useI18n();
  const { showToast } = useToast();
  const { contacts, name } = clinicConfig;
  const branch = getBranch();
  const phoneLabel = hasPhone(contacts.phone) ? formatInternationalPhone(contacts.phone) : '';
  const twoGis = twoGisLink(branch, l);
  const map = mapLink(branch, name, l, Platform.OS === 'android' ? 'android' : 'other');
  const telegramLabel = contacts.telegram.username
    ? `@${contacts.telegram.username.replace(/^@/, '')}`
    : hasPhone(contacts.telegram.phone)
      ? formatInternationalPhone(contacts.telegram.phone ?? '')
      : '';

  const available = {
    call: hasPhone(contacts.phone),
    whatsapp: hasPhone(contacts.whatsapp),
    telegram: hasTelegram(contacts.telegram),
    email: hasEmail(contacts.email),
    twoGis: twoGis !== null,
    map: map !== null,
  };

  const open = async (channel: string, url: string, fallbackValue: string, fallbackUrl?: string) => {
    hapticImpact();
    track('contact_opened', { channel });
    const opened = await openExternal(url, fallbackUrl);
    if (!opened) {
      showToast(fallbackValue ? t.common.couldNotOpen(fallbackValue) : t.common.couldNotOpenLink, 'error');
    }
    return opened;
  };

  const noop = async () => false;
  const preferred = clinicConfig.booking.requestChannel;
  const askChannel = available[preferred]
    ? preferred
    : available.whatsapp
      ? ('whatsapp' as const)
      : available.telegram
        ? ('telegram' as const)
        : null;

  return {
    available,
    phoneLabel,
    telegramLabel,
    call: available.call ? () => open('call', telUrl(contacts.phone), phoneLabel) : noop,
    whatsapp: available.whatsapp
      ? (text?: string) =>
          open('whatsapp', whatsappUrl(contacts.whatsapp, text), formatInternationalPhone(contacts.whatsapp))
      : noop,
    telegram: available.telegram
      ? (text?: string) => open('telegram', telegramUrl(contacts.telegram, text) ?? '', telegramLabel)
      : noop,
    email: available.email
      ? (subject?: string) => open('email', mailtoUrl(contacts.email, subject), contacts.email)
      : noop,
    openMap: map ? () => open('map', map.url, phoneLabel, map.fallback) : noop,
    open2gis: twoGis ? () => open('2gis', twoGis, phoneLabel, map?.fallback) : noop,
    /** Мессенджер для вопросов (null — ни WhatsApp, ни Telegram не заданы). */
    askChannel,
    ask: (text?: string) => {
      if (askChannel === 'whatsapp')
        return open('whatsapp', whatsappUrl(contacts.whatsapp, text), formatInternationalPhone(contacts.whatsapp));
      if (askChannel === 'telegram') return open('telegram', telegramUrl(contacts.telegram, text) ?? '', telegramLabel);
      return noop();
    },
  };
}

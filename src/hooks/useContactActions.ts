import { Platform } from 'react-native';

import { clinicConfig, getBranch } from '../config/clinic';
import { useI18n } from '../i18n';
import { track } from '../services/analytics';
import { openExternal } from '../services/contact';
import {
  geoUrl,
  mailtoUrl,
  mapQuery,
  telegramUrl,
  telUrl,
  twoGisUrl,
  webMapUrl,
  whatsappUrl,
} from '../services/contactLinks';
import { useToast } from '../state/ToastProvider';
import { hapticImpact } from '../utils/haptics';
import { formatInternationalPhone } from '../utils/phone';

/**
 * Связь с клиникой: звонок, WhatsApp, Telegram, почта, карта, 2ГИС.
 * Если ни одно приложение не открыло ссылку — тост с контактом.
 */
export function useContactActions() {
  const { t, l } = useI18n();
  const { showToast } = useToast();
  const { contacts, name } = clinicConfig;
  const branch = getBranch();
  const phoneLabel = formatInternationalPhone(contacts.phone);

  const open = async (channel: string, url: string, fallbackValue: string, fallbackUrl?: string) => {
    hapticImpact();
    track('contact_opened', { channel });
    const opened = await openExternal(url, fallbackUrl);
    if (!opened) showToast(t.common.couldNotOpen(fallbackValue), 'error');
    return opened;
  };

  const query = mapQuery(name, branch.address, l);

  return {
    phoneLabel,
    call: () => open('call', telUrl(contacts.phone), phoneLabel),
    whatsapp: (text?: string) =>
      open('whatsapp', whatsappUrl(contacts.whatsapp, text), formatInternationalPhone(contacts.whatsapp)),
    telegram: (text?: string) =>
      open(
        'telegram',
        telegramUrl(contacts.telegram, text),
        contacts.telegram.username
          ? `@${contacts.telegram.username}`
          : formatInternationalPhone(contacts.telegram.phone),
      ),
    email: (subject?: string) => open('email', mailtoUrl(contacts.email, subject), contacts.email),
    openMap: () =>
      open(
        'map',
        Platform.OS === 'android' ? geoUrl(query, branch.coordinates) : webMapUrl(query, branch.coordinates),
        phoneLabel,
        webMapUrl(query, branch.coordinates),
      ),
    open2gis: () => open('2gis', twoGisUrl(branch.address, query), phoneLabel, webMapUrl(query, branch.coordinates)),
  };
}

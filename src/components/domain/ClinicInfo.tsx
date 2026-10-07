import { StyleSheet, View } from 'react-native';

import { TelegramGlyph, WhatsAppGlyph } from '@/components/brand/ContactGlyphs';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  Banknote,
  CreditCard,
  Mail,
  MapPin,
  Navigation,
  Phone,
  QrCode,
  type IconComponent,
} from '@/components/ui/icons';
import { ListRow } from '@/components/ui/ListRow';
import { clinicConfig, getBranch, type PaymentMethodId } from '@/config/clinic';
import { cities } from '@/data/cities';
import { useContactActions } from '@/hooks/useContactActions';
import { useToday } from '@/hooks/useToday';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import { WEEKDAYS, weekdayOf } from '@/utils/datetime';
import { formatInternationalPhone } from '@/utils/phone';
import { capitalize } from '@/utils/text';

/** Звонок, WhatsApp, Telegram, почта — только заданные в config/clinic.ts. */
export function ContactList() {
  const { t } = useI18n();
  const contact = useContactActions();
  const { contacts } = clinicConfig;
  const { available } = contact;
  const rows = [
    available.call ? (
      <ListRow
        key="call"
        icon={Phone}
        title={t.contacts.call}
        subtitle={contact.phoneLabel}
        onPress={contact.call}
        accessibilityLabel={`${t.a11y.callClinic}, ${contact.phoneLabel}`}
      />
    ) : null,
    available.whatsapp ? (
      <ListRow
        key="whatsapp"
        icon={WhatsAppGlyph}
        iconColor="brandWhatsApp"
        title={t.contacts.whatsapp}
        subtitle={formatInternationalPhone(contacts.whatsapp)}
        onPress={() => contact.whatsapp()}
        accessibilityLabel={t.a11y.whatsappClinic}
      />
    ) : null,
    available.telegram ? (
      <ListRow
        key="telegram"
        icon={TelegramGlyph}
        iconColor="brandTelegram"
        title={t.contacts.telegram}
        subtitle={contact.telegramLabel}
        onPress={() => contact.telegram()}
        accessibilityLabel={t.a11y.telegramClinic}
      />
    ) : null,
    available.email ? (
      <ListRow
        key="email"
        icon={Mail}
        title={t.contacts.email}
        subtitle={contacts.email}
        onPress={() => contact.email(clinicConfig.name)}
        accessibilityLabel={`${t.a11y.emailClinic}, ${contacts.email}`}
      />
    ) : null,
  ].filter((row) => row !== null);

  if (rows.length === 0) return null;
  return (
    <Card padded={false}>
      {rows.map((row, index) => (
        <View key={row.key} style={index > 0 ? styles.divider : null}>
          {row}
        </View>
      ))}
    </Card>
  );
}

/** Адрес (или честная заглушка) + кнопки 2ГИС и карты, если есть по чему искать. */
export function AddressBlock() {
  const { t, l } = useI18n();
  const contact = useContactActions();
  const address = getBranch().address;
  const city = l(cities[address.cityId].name);
  const street = [address.street ? l(address.street) : null, address.building?.trim() || null]
    .filter(Boolean)
    .join(', ');
  return (
    <Card style={styles.address}>
      <View style={styles.addressRow}>
        <View style={styles.addressIcon}>
          <MapPin size={iconSize.md} color={colors.hero} />
        </View>
        <View style={styles.addressText}>
          <AppText variant="title">{street ? `${city}, ${street}` : city}</AppText>
          {address.district ? (
            <AppText variant="bodySm" color="textSecondary">
              {l(address.district)}
            </AppText>
          ) : null}
          {address.landmark ? (
            <AppText variant="bodySm" color="textSecondary">
              {l(address.landmark)}
            </AppText>
          ) : null}
          {!street ? (
            <AppText variant="bodySm" color="textSecondary">
              {t.contacts.addressUnknown}
            </AppText>
          ) : null}
        </View>
      </View>
      {contact.available.twoGis || contact.available.map ? (
        <View style={styles.addressActions}>
          {contact.available.twoGis ? (
            <Button
              label={t.contacts.open2gis}
              icon={Navigation}
              size="md"
              variant="primary"
              onPress={contact.open2gis}
            />
          ) : null}
          {contact.available.map ? (
            <Button
              label={t.contacts.openMap}
              icon={MapPin}
              size="md"
              variant={contact.available.twoGis ? 'secondary' : 'primary'}
              onPress={contact.openMap}
            />
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}

/** Часы работы по дням с перерывами. Сегодняшний день подсвечен. */
export function HoursTable() {
  const { t, fmt } = useI18n();
  const { today } = useToday();
  const todayWeekday = weekdayOf(today);
  const hours = getBranch().workingHours;
  if (WEEKDAYS.every((day) => !hours[day].hours)) {
    return (
      <Card>
        <AppText variant="body" color="textSecondary">
          {t.home.status.unknown}
        </AppText>
      </Card>
    );
  }
  return (
    <Card padded={false}>
      {WEEKDAYS.map((day, index) => {
        const schedule = hours[day];
        const isToday = day === todayWeekday;
        return (
          <View
            key={day}
            style={[styles.hoursRow, index > 0 ? styles.divider : null, isToday ? styles.today : null]}
            accessible
            accessibilityLabel={[
              t.dates.weekdays[day],
              isToday ? t.contacts.today : null,
              schedule.hours ? fmt.timeRange(schedule.hours.start, schedule.hours.end) : t.contacts.dayOff,
              ...schedule.breaks.map((b) => t.contacts.breakLabel(fmt.timeRange(b.start, b.end))),
            ]
              .filter(Boolean)
              .join(', ')}>
            <View style={styles.hoursDay}>
              <AppText variant={isToday ? 'title' : 'body'}>{capitalize(t.dates.weekdays[day])}</AppText>
              {isToday ? (
                <AppText variant="caption" color="hero">
                  {t.contacts.today}
                </AppText>
              ) : null}
            </View>
            <View style={styles.hoursValue}>
              <AppText variant={isToday ? 'title' : 'body'} color={schedule.hours ? 'textPrimary' : 'textMuted'}>
                {schedule.hours ? fmt.timeRange(schedule.hours.start, schedule.hours.end) : t.contacts.dayOff}
              </AppText>
              {schedule.breaks.map((b) => (
                <AppText key={b.start} variant="caption" color="textSecondary">
                  {t.contacts.breakLabel(fmt.timeRange(b.start, b.end))}
                </AppText>
              ))}
            </View>
          </View>
        );
      })}
    </Card>
  );
}

const PAYMENT_ICONS: Record<PaymentMethodId, IconComponent> = { cash: Banknote, card: CreditCard, qr: QrCode };

/** Способы оплаты: только в клинике после приёма. */
export function PaymentMethods() {
  const { t } = useI18n();
  return (
    <Card style={styles.payment}>
      {clinicConfig.paymentMethods.map((method) => {
        const Icon = PAYMENT_ICONS[method];
        return (
          <View key={method} style={styles.paymentRow}>
            <Icon size={iconSize.md} color={colors.hero} />
            <AppText variant="body" style={styles.paymentText}>
              {t.contacts.paymentMethods[method]}
            </AppText>
          </View>
        );
      })}
      <AppText variant="bodySm" color="textSecondary">
        {t.contacts.paymentNote}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  address: {
    gap: spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addressIcon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addressText: {
    flex: 1,
    gap: 2,
    justifyContent: 'center',
  },
  addressActions: {
    gap: spacing.xs,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  today: {
    backgroundColor: colors.surfaceTinted,
  },
  hoursDay: {
    flex: 1,
  },
  hoursValue: {
    alignItems: 'flex-end',
  },
  payment: {
    gap: spacing.sm,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  paymentText: {
    flex: 1,
  },
});

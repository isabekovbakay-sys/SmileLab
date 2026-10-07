import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import { TelegramGlyph, WhatsAppGlyph } from '@/components/brand/ContactGlyphs';
import { BookingScaffold } from '@/components/booking/BookingScaffold';
import { doctorLabel } from '@/components/booking/bookingText';
import { useSubmitBooking } from '@/components/booking/useSubmitBooking';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PhoneField, TextField } from '@/components/ui/Fields';
import {
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Stethoscope,
  type IconComponent,
} from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { EmptyState } from '@/components/ui/StateViews';
import { useDoctors, useServices } from '@/hooks/useClinicData';
import { useToday } from '@/hooks/useToday';
import { useI18n } from '@/i18n';
import { getDeliveryMode, getScheduleMode } from '@/services/bookingDelivery';
import { ANY_DOCTOR, bookingRoutes, useBooking } from '@/state/BookingProvider';
import { useProfile } from '@/state/ProfileProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import { normalizeKgPhone } from '@/utils/phone';
import { validateName, validatePhone } from '@/utils/validation';

/** Шаг 3: сводка (у каждой строки «Изменить»), имя, телефон +996, комментарий. */
export default function BookingDetailsScreen() {
  const i18n = useI18n();
  const { t, l, fmt } = i18n;
  const { draft, stepNumber, steps } = useBooking();
  const services = useServices();
  const doctors = useDoctors();
  const { profile } = useProfile();
  const { today } = useToday();

  const service = services.data?.find((s) => s.id === draft.serviceId);
  const doctor = draft.doctorChoice === ANY_DOCTOR ? undefined : doctors.data?.find((d) => d.id === draft.doctorChoice);
  const { submit, submitting } = useSubmitBooking(service, doctors.data ?? []);

  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(normalizeKgPhone(profile.phone));
  const [comment, setComment] = useState('');
  const [attempted, setAttempted] = useState(false);
  const nameRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const commentRef = useRef<TextInput>(null);

  const nameStatus = validateName(name);
  const phoneStatus = validatePhone(phone);
  const nameError = !attempted
    ? null
    : nameStatus === 'empty'
      ? t.booking.errors.nameEmpty
      : nameStatus === 'tooShort'
        ? t.booking.errors.nameShort
        : null;
  const phoneError = !attempted
    ? null
    : phoneStatus === 'empty'
      ? t.booking.errors.phoneEmpty
      : phoneStatus === 'incomplete'
        ? t.booking.errors.phoneIncomplete
        : phoneStatus === 'invalidPrefix'
          ? t.booking.errors.phoneInvalidPrefix
          : null;

  const mode = getDeliveryMode();
  const submitLabel =
    mode === 'whatsapp' ? t.booking.submitWhatsApp : mode === 'telegram' ? t.booking.submitTelegram : t.booking.submit;
  const submitIcon: IconComponent =
    mode === 'whatsapp' ? WhatsAppGlyph : mode === 'telegram' ? TelegramGlyph : CalendarCheck;

  const onSubmit = () => {
    setAttempted(true);
    if (nameStatus !== 'ok') {
      nameRef.current?.focus();
      return;
    }
    if (phoneStatus !== 'ok') {
      phoneRef.current?.focus();
      return;
    }
    submit({ name, phone, comment });
  };

  if (!draft.serviceId || !draft.date || !draft.time) {
    return (
      <BookingScaffold title={t.booking.detailsTitle} step={null} confirmClose={false}>
        <EmptyState
          icon={ClipboardList}
          title={t.booking.serviceTitle}
          text={t.booking.serviceHint}
          actionLabel={t.common.continue}
          onAction={() => router.replace(bookingRoutes.service)}
        />
      </BookingScaffold>
    );
  }

  return (
    <BookingScaffold
      title={t.booking.detailsTitle}
      step={{ current: stepNumber('details'), total: steps.length }}
      confirmClose
      onBack={() => router.back()}
      footer={
        <Button
          testID="booking-submit"
          label={submitLabel}
          icon={submitIcon}
          variant="accent"
          loading={submitting}
          onPress={onSubmit}
        />
      }>
      <View style={styles.body}>
        <Card padded={false}>
          <SummaryRow
            icon={Stethoscope}
            label={t.booking.summaryService}
            value={service ? l(service.name) : ''}
            detail={service ? fmt.serviceMeta(service) : undefined}
            onChange={() => router.push(bookingRoutes.service)}
          />
          <SummaryRow
            divider
            icon={CalendarDays}
            label={getScheduleMode() === 'request' ? t.booking.summaryWanted : t.booking.summaryWhen}
            value={fmt.relativeDateTime(draft.date, draft.time, today)}
            detail={doctorLabel(i18n, { anyDoctor: draft.doctorChoice === ANY_DOCTOR }, doctor)}
            onChange={() => router.back()}
          />
        </Card>

        <View style={styles.form}>
          <TextField
            ref={nameRef}
            label={t.booking.nameLabel}
            placeholder={t.booking.namePlaceholder}
            value={name}
            onChangeText={setName}
            error={nameError}
            autoComplete="name"
            textContentType="name"
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => phoneRef.current?.focus()}
            submitBehavior="submit"
          />
          <PhoneField
            ref={phoneRef}
            label={t.booking.phoneLabel}
            value={phone}
            onChangeNational={setPhone}
            error={phoneError}
            returnKeyType="next"
            onSubmitEditing={() => commentRef.current?.focus()}
            submitBehavior="submit"
          />
          <TextField
            ref={commentRef}
            label={t.booking.commentLabel}
            optionalLabel={t.booking.optional}
            placeholder={t.booking.commentPlaceholder}
            hint={t.booking.commentHint}
            value={comment}
            onChangeText={setComment}
            multiline
            maxLength={200}
          />
        </View>

        <View style={styles.notes}>
          <View style={styles.noteRow}>
            <CreditCard size={iconSize.md} color={colors.hero} />
            <AppText variant="bodySm" color="textSecondary" style={styles.flex}>
              {t.booking.paymentLine}
            </AppText>
          </View>
          <AppText variant="caption" color="textSecondary">
            {t.booking.consentPrefix}
            <AppText
              variant="caption"
              color="textLink"
              style={styles.link}
              accessibilityRole="link"
              onPress={() => router.push('/privacy')}>
              {t.booking.consentLink}
            </AppText>
            {t.booking.consentSuffix}
          </AppText>
        </View>
      </View>
    </BookingScaffold>
  );
}

interface SummaryRowProps {
  icon: IconComponent;
  label: string;
  value: string;
  detail?: string;
  onChange: () => void;
  divider?: boolean;
}

function SummaryRow({ icon: Icon, label, value, detail, onChange, divider }: SummaryRowProps) {
  const { t } = useI18n();
  return (
    <View style={[styles.summaryRow, divider ? styles.divider : null]}>
      <View style={styles.summaryIcon}>
        <Icon size={iconSize.md} color={colors.hero} />
      </View>
      <View style={styles.flex}>
        <AppText variant="caption" color="textSecondary">
          {label}
        </AppText>
        <AppText variant="title">{value}</AppText>
        {detail ? (
          <AppText variant="bodySm" color="textSecondary">
            {detail}
          </AppText>
        ) : null}
      </View>
      <PressableScale
        onPress={onChange}
        accessibilityRole="button"
        accessibilityLabel={`${t.common.change}: ${label}`}
        style={styles.change}>
        <AppText variant="caption" color="textLink">
          {t.common.change}
        </AppText>
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.gutter,
    gap: spacing.xl,
  },
  flex: {
    flex: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  summaryIcon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  change: {
    minHeight: layout.touch,
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  form: {
    gap: spacing.lg,
  },
  notes: {
    gap: spacing.sm,
  },
  noteRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  link: {
    textDecorationLine: 'underline',
  },
});

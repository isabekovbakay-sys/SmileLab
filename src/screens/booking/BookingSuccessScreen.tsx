import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback } from 'react';
import { BackHandler, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TelegramGlyph, WhatsAppGlyph } from '@/components/brand/ContactGlyphs';
import { Fade } from '@/components/brand/Fade';
import { appointmentMessage, doctorLabel } from '@/components/booking/bookingText';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { IconButton } from '@/components/ui/IconButton';
import { CalendarDays, Check, Stethoscope, Users, X } from '@/components/ui/icons';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { useDoctors, useServices } from '@/hooks/useClinicData';
import { useToday } from '@/hooks/useToday';
import { useI18n } from '@/i18n';
import { channelTitle, getDeliveryMode, requestChannel, sendToMessenger } from '@/services/bookingDelivery';
import { useAppointments } from '@/state/AppointmentsProvider';
import { useToast } from '@/state/ToastProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';

/** Экран успеха. Кнопки закреплены внизу; системная «Назад» закрывает весь поток записи. */
export default function BookingSuccessScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const i18n = useI18n();
  const { t, l, fmt } = i18n;
  const insets = useSafeAreaInsets();
  const { appointments } = useAppointments();
  const services = useServices();
  const doctors = useDoctors();
  const { today } = useToday();
  const { showToast } = useToast();

  const appointment = appointments.find((a) => a.id === id);
  const service = services.data?.find((s) => s.id === appointment?.serviceId);
  const doctor = doctors.data?.find((d) => d.id === appointment?.doctorId);
  const mode = getDeliveryMode();
  const channel = requestChannel();
  const channelName = channelTitle(channel);
  const ChannelIcon = channel === 'whatsapp' ? WhatsAppGlyph : TelegramGlyph;

  const goHome = useCallback(() => router.dismissTo('/'), []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        goHome();
        return true;
      });
      return () => subscription.remove();
    }, [goHome]),
  );

  const title =
    mode === 'api'
      ? t.booking.success.titleApi
      : mode === 'demo'
        ? t.booking.success.titleDemo
        : t.booking.success.titleMessenger;
  const text =
    mode === 'api'
      ? t.booking.success.textApi
      : mode === 'demo'
        ? t.booking.success.textDemo(channelName)
        : t.booking.success.textMessenger(channelName);

  const sendAgain = async () => {
    if (!appointment) return;
    const opened = await sendToMessenger(channel, appointmentMessage(i18n, 'new', appointment, service, doctor));
    if (!opened) showToast(t.common.couldNotOpenLink, 'error');
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.close, { top: insets.top + spacing.xs }]}>
        <IconButton icon={X} accessibilityLabel={t.common.toHome} onPress={goHome} testID="success-close" />
      </View>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xxl }]}
        showsVerticalScrollIndicator={false}>
        <Fade fromScale={0.8} style={styles.checkWrap}>
          <View style={styles.check}>
            <Check size={iconSize.hero} color={colors.onPrimary} strokeWidth={3} />
          </View>
        </Fade>
        <Fade delay={120} style={styles.texts}>
          <AppText variant="h1" align="center" accessibilityRole="header">
            {title}
          </AppText>
          <AppText variant="body" color="textSecondary" align="center">
            {text}
          </AppText>
        </Fade>

        {appointment ? (
          <Fade delay={220}>
            <Card style={styles.card}>
              <AppText variant="numeral" color="hero">
                {appointment.time}
              </AppText>
              <AppText variant="title">{fmt.relativeDate(appointment.date, today)}</AppText>
              <View style={styles.cardRow}>
                <Stethoscope size={iconSize.md} color={colors.hero} />
                <AppText variant="body" style={styles.flex}>
                  {service ? l(service.name) : ''}
                </AppText>
              </View>
              <View style={styles.cardRow}>
                <Users size={iconSize.md} color={colors.hero} />
                <AppText variant="body" style={styles.flex}>
                  {doctorLabel(i18n, appointment, doctor)}
                </AppText>
              </View>
            </Card>
          </Fade>
        ) : null}

        {mode === 'demo' ? <DemoNotice /> : null}
      </ScrollView>

      <StickyFooter>
        {mode !== 'api' && appointment ? (
          <Button
            testID="success-messenger"
            label={mode === 'demo' ? t.booking.success.sendManually(channelName) : t.booking.success.reopen(channelName)}
            icon={ChannelIcon}
            variant="accent"
            onPress={sendAgain}
          />
        ) : null}
        <Button
          testID="success-appointments"
          label={t.booking.success.myAppointments}
          icon={CalendarDays}
          variant={mode === 'api' ? 'accent' : 'secondary'}
          size={mode === 'api' ? 'lg' : 'md'}
          onPress={() => router.dismissTo('/appointments')}
        />
      </StickyFooter>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    paddingHorizontal: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  checkWrap: {
    alignItems: 'center',
  },
  check: {
    width: spacing.huge * 2,
    height: spacing.huge * 2,
    borderRadius: radius.pill,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  texts: {
    gap: spacing.xs,
  },
  card: {
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  close: {
    position: 'absolute',
    right: spacing.xs,
    zIndex: 1,
  },
});

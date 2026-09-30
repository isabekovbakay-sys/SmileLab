import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { ConfirmSheet } from '@/components/ui/BottomSheet';
import { IconButton } from '@/components/ui/IconButton';
import { CalendarX, ChevronLeft, X } from '@/components/ui/icons';
import { StickyFooter } from '@/components/ui/StickyFooter';
import { useI18n } from '@/i18n';
import { colors, layout, radius, spacing } from '@/theme';

import { useBookingNavigation } from './useBookingNavigation';

interface BookingScaffoldProps {
  title: string;
  subtitle?: string;
  /** Номер шага и всего шагов. null — без прогресса (перенос). */
  step: { current: number; total: number } | null;
  /** Спрашивать ли подтверждение при закрытии. */
  confirmClose: boolean;
  /** Кнопка «Назад» в шапке (если под экраном есть предыдущий шаг). */
  onBack?: () => void;
  footer?: ReactNode;
  /** Контент без боковых отступов: отступ задаёт каждый блок (лента дней идёт на всю ширину). */
  children: ReactNode;
}

export function BookingScaffold({ title, subtitle, step, confirmClose, onBack, footer, children }: BookingScaffoldProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { closeFlow } = useBookingNavigation();
  const [confirming, setConfirming] = useState(false);

  const requestClose = () => {
    if (confirmClose) setConfirming(true);
    else closeFlow();
  };

  return (
    <View style={styles.root}>
      <View style={[styles.header, { paddingTop: insets.top }]}>
        <View style={styles.headerRow}>
          <View style={styles.side}>
            {onBack ? <IconButton icon={ChevronLeft} accessibilityLabel={t.a11y.back} onPress={onBack} /> : null}
          </View>
          <View style={styles.stepWrap}>
            {step ? (
              <AppText variant="caption" color="textSecondary" align="center">
                {t.a11y.stepProgress(step.current, step.total)}
              </AppText>
            ) : null}
          </View>
          <View style={[styles.side, styles.sideRight]}>
            <IconButton icon={X} accessibilityLabel={t.booking.closeA11y} onPress={requestClose} testID="booking-close" />
          </View>
        </View>
        {step ? (
          <View
            style={styles.progressTrack}
            accessibilityRole="progressbar"
            accessibilityLabel={t.a11y.stepProgress(step.current, step.total)}
            accessibilityValue={{ min: 0, max: step.total, now: step.current }}>
            <View style={[styles.progressFill, { width: `${(step.current / step.total) * 100}%` }]} />
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.titleBlock}>
            <AppText variant="h1" accessibilityRole="header">
              {title}
            </AppText>
            {subtitle ? (
              <AppText variant="body" color="textSecondary">
                {subtitle}
              </AppText>
            ) : null}
          </View>
          {children}
        </ScrollView>
        {footer ? <StickyFooter>{footer}</StickyFooter> : null}
      </KeyboardAvoidingView>

      <ConfirmSheet
        visible={confirming}
        icon={CalendarX}
        title={t.booking.abortTitle}
        message={t.booking.abortText}
        confirmLabel={t.booking.abortConfirm}
        cancelLabel={t.booking.abortCancel}
        tone="danger"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          closeFlow();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  header: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xs,
  },
  headerRow: {
    height: layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
  },
  side: {
    width: layout.touch + spacing.xs,
    flexDirection: 'row',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  stepWrap: {
    flex: 1,
  },
  progressTrack: {
    height: spacing.xxs,
    marginHorizontal: layout.gutter - spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceMuted,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.hero,
  },
  content: {
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
  },
  titleBlock: {
    paddingHorizontal: layout.gutter,
    gap: spacing.xs,
  },
});

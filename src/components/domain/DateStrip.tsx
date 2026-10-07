import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { PressableScale } from '@/components/ui/PressableScale';
import { useI18n } from '@/i18n';
import { colors, layout, radius, spacing } from '@/theme';
import type { DayAvailability, LocalDate } from '@/types/domain';
import { dayOfMonth } from '@/utils/datetime';
import { hapticSelection } from '@/utils/haptics';

const DAY_WIDTH = 64;
const GAP = spacing.xs;

interface DateStripProps {
  days: DayAvailability[];
  selected: LocalDate | null;
  today: LocalDate;
  onSelect: (date: LocalDate) => void;
  /** Режим «желаемое время»: день — рабочий или нет, без «мест нет». */
  wanted?: boolean;
}

/** Лента дней: выходные неактивны, точка — есть свободное время. */
export function DateStrip({ days, selected, today, onSelect, wanted = false }: DateStripProps) {
  const { t, fmt } = useI18n();
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = days.findIndex((d) => d.date === selected);

  useEffect(() => {
    if (selectedIndex < 0) return;
    const x = selectedIndex < 3 ? 0 : (selectedIndex - 1) * (DAY_WIDTH + GAP);
    scrollRef.current?.scrollTo({ x, animated: true });
  }, [selectedIndex]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}>
      {days.map((day) => {
        const isSelected = day.date === selected;
        const hasSlots = day.slots.length > 0;
        const disabled = !day.clinicOpen;
        const label = fmt.dayChipLabel(day.date, today);
        const state = disabled ? 'closed' : hasSlots ? (wanted ? 'workday' : 'available') : wanted ? 'passed' : 'full';
        return (
          <PressableScale
            key={day.date}
            disabled={disabled}
            onPress={() => {
              hapticSelection();
              onSelect(day.date);
            }}
            accessibilityRole="button"
            accessibilityLabel={t.a11y.day(fmt.relativeDate(day.date, today), state)}
            accessibilityState={{ selected: isSelected, disabled }}
            style={[styles.day, isSelected ? styles.daySelected : null, disabled ? styles.dayDisabled : null]}>
            <AppText
              variant="caption"
              color={isSelected ? 'textOnHeroMuted' : 'textSecondary'}
              numberOfLines={1}
              maxFontSizeMultiplier={1.1}>
              {label}
            </AppText>
            <AppText variant="h3" color={isSelected ? 'textOnHero' : 'textPrimary'} maxFontSizeMultiplier={1.1}>
              {dayOfMonth(day.date)}
            </AppText>
            <View
              style={[styles.dot, hasSlots ? (isSelected ? styles.dotOnSelected : styles.dotActive) : styles.dotHidden]}
            />
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: layout.gutter,
    gap: GAP,
  },
  day: {
    width: DAY_WIDTH,
    minHeight: DAY_WIDTH + spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.xs,
  },
  daySelected: {
    backgroundColor: colors.hero,
    borderColor: colors.hero,
  },
  dayDisabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.surfaceMuted,
  },
  dot: {
    width: spacing.xs - 2,
    height: spacing.xs - 2,
    borderRadius: radius.pill,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  dotOnSelected: {
    backgroundColor: colors.accent,
  },
  dotHidden: {
    backgroundColor: 'transparent',
  },
});

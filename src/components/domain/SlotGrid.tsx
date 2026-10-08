import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Sun, Sunrise, Sunset, type IconComponent } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { ClockTime, TimeSlot } from '@/types/domain';
import { toMinutes } from '@/utils/datetime';
import { hapticSelection } from '@/utils/haptics';

type Period = 'morning' | 'afternoon' | 'evening';

const GAP = spacing.xs;
const PERIOD_ICONS: Record<Period, IconComponent> = { morning: Sunrise, afternoon: Sun, evening: Sunset };

function periodOf(time: ClockTime): Period {
  const minutes = toMinutes(time);
  if (minutes < 12 * 60) return 'morning';
  if (minutes < 17 * 60) return 'afternoon';
  return 'evening';
}

interface SlotGridProps {
  slots: TimeSlot[];
  selected: ClockTime | null;
  onSelect: (slot: TimeSlot) => void;
}

/** Свободное время, сгруппированное «Утро / День / Вечер». */
export function SlotGrid({ slots, selected, onSelect }: SlotGridProps) {
  const { t } = useI18n();
  const [width, setWidth] = useState(0);
  const columns = width >= 400 ? 5 : 4;
  const itemWidth = width ? Math.floor((width - GAP * (columns - 1)) / columns) : 0;

  const groups: { period: Period; slots: TimeSlot[] }[] = (['morning', 'afternoon', 'evening'] as Period[])
    .map((period) => ({ period, slots: slots.filter((s) => periodOf(s.time) === period) }))
    .filter((g) => g.slots.length > 0);

  return (
    <View style={styles.root} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {itemWidth > 0
        ? groups.map((group) => {
            const Icon = PERIOD_ICONS[group.period];
            return (
              <View key={group.period} style={styles.group}>
                <View style={styles.header}>
                  <Icon size={iconSize.sm} color={colors.textSecondary} />
                  <AppText variant="overline" color="textSecondary">
                    {t.booking[group.period]}
                  </AppText>
                </View>
                <View style={styles.grid}>
                  {group.slots.map((slot) => {
                    const isSelected = slot.time === selected;
                    return (
                      <PressableScale
                        key={slot.time}
                        testID={`slot-${slot.time}`}
                        onPress={() => {
                          hapticSelection();
                          onSelect(slot);
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t.a11y.slot(slot.time)}
                        accessibilityState={{ selected: isSelected }}
                        style={[styles.slot, { width: itemWidth }, isSelected ? styles.slotSelected : null]}>
                        <AppText
                          variant="bodyMedium"
                          color={isSelected ? 'onPrimary' : 'textPrimary'}
                          maxFontSizeMultiplier={1.2}
                          style={styles.slotText}>
                          {slot.time}
                        </AppText>
                      </PressableScale>
                    );
                  })}
                </View>
              </View>
            );
          })
        : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.lg,
  },
  group: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  slot: {
    minHeight: layout.touch,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    fontVariant: ['tabular-nums'],
  },
});

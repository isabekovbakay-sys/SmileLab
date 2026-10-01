import { StyleSheet, View } from 'react-native';

import { colors, fontFamily, iconSize, layout, radius, spacing, type ColorToken } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

import { AppText } from './AppText';
import { Check } from './icons';
import { PressableScale } from './PressableScale';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
  testID?: string;
}

/** Чип фильтра. Выбор обозначен не только цветом: появляется галочка. */
export function Chip({ label, selected, onPress, accessibilityLabel, testID }: ChipProps) {
  return (
    <PressableScale
      testID={testID}
      onPress={() => {
        hapticSelection();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ selected }}
      style={[styles.chip, selected ? styles.chipSelected : null]}>
      {selected ? <Check size={iconSize.sm} color={colors.onPrimary} strokeWidth={2.6} /> : null}
      <AppText variant="caption" color={selected ? 'onPrimary' : 'textPrimary'} numberOfLines={1}>
        {label}
      </AppText>
    </PressableScale>
  );
}

interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  testID?: string;
}

/** Переключатель сегментов (вкладки «Предстоящие / История», язык). */
export function Segmented<T extends string>({ options, value, onChange, testID }: SegmentedProps<T>) {
  return (
    <View style={styles.segmented} accessibilityRole="tablist" testID={testID}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <PressableScale
            key={option.value}
            scaleTo={0.98}
            onPress={() => {
              if (!selected) hapticSelection();
              onChange(option.value);
            }}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            style={[styles.segment, selected ? styles.segmentSelected : null]}>
            <AppText
              variant="caption"
              color={selected ? 'textPrimary' : 'textSecondary'}
              align="center"
              numberOfLines={1}
              style={selected ? styles.segmentLabelSelected : null}>
              {option.label}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

export type PillTone = 'warning' | 'success' | 'neutral' | 'muted' | 'error';

const pillColors: Record<PillTone, { bg: ColorToken; fg: ColorToken }> = {
  warning: { bg: 'warningSoft', fg: 'warning' },
  success: { bg: 'successSoft', fg: 'success' },
  neutral: { bg: 'surfaceTinted', fg: 'hero' },
  muted: { bg: 'surfaceMuted', fg: 'textSecondary' },
  error: { bg: 'errorSoft', fg: 'error' },
};

export function StatusPill({ label, tone }: { label: string; tone: PillTone }) {
  const c = pillColors[tone];
  return (
    <View style={[styles.pill, { backgroundColor: colors[c.bg] }]}>
      <View style={[styles.pillDot, { backgroundColor: colors[c.fg] }]} />
      <AppText variant="caption" color={c.fg} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: layout.touch,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    padding: spacing.xxs,
    gap: spacing.xxs,
  },
  segment: {
    flex: 1,
    minHeight: layout.touch - spacing.xs,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  segmentSelected: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  segmentLabelSelected: {
    fontFamily: fontFamily.semibold,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
    borderRadius: radius.pill,
  },
  pillDot: {
    width: spacing.xs,
    height: spacing.xs,
    borderRadius: radius.pill,
  },
});

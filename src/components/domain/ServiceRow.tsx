import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ServiceGlyph } from '@/components/brand/ServiceGlyph';
import { AppText } from '@/components/ui/AppText';
import { ChevronRight } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { Service } from '@/types/domain';

interface ServiceRowProps {
  service: Service;
  onPress: () => void;
  divider?: boolean;
  /** Элемент справа вместо шеврона (например, RadioMark в записи). */
  right?: ReactNode;
  selected?: boolean;
  testID?: string;
}

/** Строка услуги: иконка, название, одна строка описания, «от 2 500 сом · ≈ 60 мин». */
export function ServiceRow({ service, onPress, divider, right, selected, testID }: ServiceRowProps) {
  const { l, fmt } = useI18n();
  const meta = `${fmt.price(service.priceFrom)} · ${fmt.duration(service.durationMin)}`;
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${l(service.name)}. ${meta}`}
      accessibilityState={selected === undefined ? undefined : { selected }}
      style={[styles.row, divider ? styles.divider : null, selected ? styles.selected : null]}>
      <View style={styles.glyph}>
        <ServiceGlyph glyph={service.glyph} size={iconSize.lg} />
      </View>
      <View style={styles.text}>
        <AppText variant="title">{l(service.name)}</AppText>
        <AppText variant="bodySm" color="textSecondary" numberOfLines={1}>
          {l(service.summary)}
        </AppText>
        <AppText variant="caption" color="hero">
          {meta}
        </AppText>
      </View>
      {right ?? <ChevronRight size={iconSize.md} color={colors.textMuted} />}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + spacing.xxs,
    minHeight: layout.touch + spacing.lg,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  selected: {
    backgroundColor: colors.surfaceTinted,
  },
  glyph: {
    width: layout.touch,
    height: layout.touch,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
});

import { useEffect, useState } from 'react';
import { Animated, StyleSheet, View, type DimensionValue, type StyleProp, type ViewStyle } from 'react-native';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useI18n } from '@/i18n';
import { colors, layout, radius, spacing } from '@/theme';
import { useNativeDriver } from '@/utils/animation';

interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  rounded?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = spacing.md, rounded = radius.sm, style }: SkeletonProps) {
  const reduced = useReducedMotion();
  const [pulse] = useState(() => new Animated.Value(0.55));

  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver }),
        Animated.timing(pulse, { toValue: 0.55, duration: 700, useNativeDriver }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);

  return (
    <Animated.View
      style={[{ width, height, borderRadius: rounded, backgroundColor: colors.skeleton, opacity: pulse }, style]}
    />
  );
}

/** Скелетон списка в карточке (услуги, записи, врачи). */
export function SkeletonList({ rows = 4, withIcon = true }: { rows?: number; withIcon?: boolean }) {
  const { t } = useI18n();
  return (
    <View style={styles.card} accessible accessibilityRole="progressbar" accessibilityLabel={t.common.loading}>
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={[styles.row, i > 0 ? styles.divider : null]}>
          {withIcon ? <Skeleton width={layout.iconTile} height={layout.iconTile} rounded={radius.md} /> : null}
          <View style={styles.lines}>
            <Skeleton width="70%" height={spacing.md} />
            <Skeleton width="45%" height={spacing.sm} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  lines: {
    flex: 1,
    gap: spacing.xs,
  },
});

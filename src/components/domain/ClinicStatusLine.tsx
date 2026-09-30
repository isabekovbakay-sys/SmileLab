import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { ChevronRight } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useClinicStatus } from '@/hooks/useClinicStatus';
import { colors, iconSize, layout, radius, spacing } from '@/theme';

/** «Сегодня открыто до 19:00». Обновляется раз в минуту; нажатие открывает часы работы. */
export function ClinicStatusLine() {
  const { status, label } = useClinicStatus();
  const dotColor = status.kind === 'open' ? colors.success : status.kind === 'break' ? colors.warning : colors.textMuted;
  return (
    <PressableScale
      onPress={() => router.push('/contact')}
      accessibilityRole="button"
      accessibilityLabel={label}
      scaleTo={0.99}
      style={styles.row}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <AppText variant="bodyMedium" style={styles.text}>
        {label}
      </AppText>
      <ChevronRight size={iconSize.sm} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touch,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: {
    width: spacing.xs + 2,
    height: spacing.xs + 2,
    borderRadius: radius.pill,
  },
  text: {
    flex: 1,
  },
});

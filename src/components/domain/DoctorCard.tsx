import { StyleSheet, View } from 'react-native';

import { Monogram } from '@/components/brand/Monogram';
import { AppText } from '@/components/ui/AppText';
import { ChevronRight, Languages } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { Doctor } from '@/types/domain';

const CARD_WIDTH = 216;

/** Карточка врача для карусели на главной. */
export function DoctorCard({ doctor, onPress }: { doctor: Doctor; onPress: () => void }) {
  const { l, t } = useI18n();
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${l(doctor.name)}, ${l(doctor.role)}`}
      style={styles.card}>
      <Monogram id={doctor.id} name={l(doctor.name)} size={layout.touch + spacing.xs} />
      <View style={styles.text}>
        <AppText variant="title" numberOfLines={1}>
          {l(doctor.name)}
        </AppText>
        <AppText variant="bodySm" color="textSecondary" numberOfLines={2}>
          {l(doctor.role)}
        </AppText>
      </View>
      <View style={styles.langs}>
        <Languages size={iconSize.sm} color={colors.hero} />
        <AppText variant="caption" color="textSecondary" numberOfLines={2} style={styles.langText}>
          {t.languages.speaks(doctor.languages)}
        </AppText>
      </View>
    </PressableScale>
  );
}

/** Строка врача для списков. */
export function DoctorRow({ doctor, onPress, divider }: { doctor: Doctor; onPress: () => void; divider?: boolean }) {
  const { l } = useI18n();
  return (
    <PressableScale
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={`${l(doctor.name)}, ${l(doctor.role)}`}
      style={[styles.row, divider ? styles.divider : null]}>
      <Monogram id={doctor.id} name={l(doctor.name)} size={layout.touch} />
      <View style={styles.rowText}>
        <AppText variant="title">{l(doctor.name)}</AppText>
        <AppText variant="bodySm" color="textSecondary">
          {l(doctor.role)}
        </AppText>
      </View>
      <ChevronRight size={iconSize.md} color={colors.textMuted} />
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  text: {
    gap: 2,
    minHeight: spacing.huge + spacing.md,
  },
  langs: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xxs + 2,
  },
  langText: {
    flex: 1,
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
  rowText: {
    flex: 1,
    gap: 2,
  },
});

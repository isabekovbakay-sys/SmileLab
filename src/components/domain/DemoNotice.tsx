import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Info } from '@/components/ui/icons';
import { clinicConfig } from '@/config/clinic';
import { useI18n } from '@/i18n';
import { colors, iconSize, radius, spacing } from '@/theme';

/** Честная плашка «Демо-режим». Исчезает, когда в config/clinic.ts выставлен isDemo: false. */
export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  if (!clinicConfig.isDemo) return null;
  return (
    <View style={styles.root} accessible accessibilityLabel={`${t.common.demoBadge}. ${t.common.demoNotice}`}>
      <Info size={iconSize.md} color={colors.warning} />
      <AppText variant={compact ? 'caption' : 'bodySm'} color="warning" style={styles.text}>
        {t.common.demoNotice}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    backgroundColor: colors.warningSoft,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  text: {
    flex: 1,
  },
});

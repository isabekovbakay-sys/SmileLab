import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Info } from '@/components/ui/icons';
import { appConfig } from '@/config/app';
import { clinicConfig } from '@/config/clinic';
import { useI18n } from '@/i18n';
import { colors, iconSize, radius, spacing } from '@/theme';

/** Показывать ли демо-плашки (скрываются для скриншотов магазина). */
export const showDemo = clinicConfig.isDemo && !appConfig.storeScreenshots;

/** Честная плашка «Демо-режим». */
export function DemoNotice({ compact = false }: { compact?: boolean }) {
  const { t } = useI18n();
  if (!showDemo) return null;
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

import { StyleSheet, View } from 'react-native';

import { colors, iconSize, layout, spacing } from '@/theme';

import { AppText } from './AppText';
import { ChevronRight } from './icons';
import { PressableScale } from './PressableScale';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="h3" style={styles.title} accessibilityRole="header">
        {title}
      </AppText>
      {actionLabel && onAction ? (
        <PressableScale onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel} style={styles.action}>
          <AppText variant="caption" color="textLink">
            {actionLabel}
          </AppText>
          <ChevronRight size={iconSize.sm} color={colors.textLink} />
        </PressableScale>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touch,
  },
  title: {
    flex: 1,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    minHeight: layout.touch,
    paddingLeft: spacing.xs,
  },
});

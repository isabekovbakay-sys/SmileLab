import { StyleSheet, View } from 'react-native';

import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import { CircleAlert, RotateCcw, type IconComponent } from './icons';

interface EmptyStateProps {
  icon: IconComponent;
  title: string;
  text?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: IconComponent;
}

/** Пустое состояние всегда предлагает действие. */
export function EmptyState({ icon: Icon, title, text, actionLabel, onAction, actionIcon }: EmptyStateProps) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Icon size={iconSize.xl} color={colors.hero} />
      </View>
      <AppText variant="h3" align="center" accessibilityRole="header">
        {title}
      </AppText>
      {text ? (
        <AppText variant="body" color="textSecondary" align="center">
          {text}
        </AppText>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} icon={actionIcon} variant="accent" style={styles.action} />
      ) : null}
    </View>
  );
}

export function ErrorState({ onRetry, title, text }: { onRetry: () => void; title?: string; text?: string }) {
  const { t } = useI18n();
  return (
    <View style={styles.root} accessibilityLiveRegion="polite">
      <View style={[styles.icon, styles.iconError]}>
        <CircleAlert size={iconSize.xl} color={colors.error} />
      </View>
      <AppText variant="h3" align="center" accessibilityRole="header">
        {title ?? t.common.loadErrorTitle}
      </AppText>
      <AppText variant="body" color="textSecondary" align="center">
        {text ?? t.common.loadErrorText}
      </AppText>
      <Button label={t.common.retry} onPress={onRetry} icon={RotateCcw} variant="primary" style={styles.action} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.md,
  },
  icon: {
    width: layout.touch + spacing.md,
    height: layout.touch + spacing.md,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconError: {
    backgroundColor: colors.errorSoft,
  },
  action: {
    alignSelf: 'stretch',
    marginTop: spacing.sm,
  },
});

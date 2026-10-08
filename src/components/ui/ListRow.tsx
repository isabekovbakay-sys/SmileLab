import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, iconSize, layout, radius, spacing, type ColorToken } from '@/theme';

import { AppText } from './AppText';
import { ChevronRight, type IconComponent } from './icons';
import { PressableScale } from './PressableScale';

interface ListRowProps {
  title: string;
  subtitle?: string;
  icon?: IconComponent;
  iconColor?: ColorToken;
  iconBackground?: ColorToken;
  /** Текст справа (например, значение). */
  value?: string;
  right?: ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  divider?: boolean;
  tone?: 'default' | 'danger';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function ListRow({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'hero',
  iconBackground = 'surfaceTinted',
  value,
  right,
  onPress,
  chevron = Boolean(onPress),
  divider = false,
  tone = 'default',
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ListRowProps) {
  const content = (
    <View style={[styles.row, divider ? styles.divider : null]}>
      {Icon ? (
        <View style={[styles.icon, { backgroundColor: colors[iconBackground] }]}>
          <Icon size={iconSize.md} color={colors[tone === 'danger' ? 'error' : iconColor]} strokeWidth={2} />
        </View>
      ) : null}
      <View style={styles.text}>
        <AppText variant="title" color={tone === 'danger' ? 'error' : 'textPrimary'}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="bodySm" color="textSecondary">
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {value ? (
        <AppText variant="bodySm" color="textSecondary" style={styles.value}>
          {value}
        </AppText>
      ) : null}
      {right}
      {chevron ? <ChevronRight size={iconSize.md} color={colors.textMuted} /> : null}
    </View>
  );

  if (!onPress) return content;
  return (
    <PressableScale
      testID={testID}
      onPress={onPress}
      scaleTo={0.99}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? (subtitle ? `${title}. ${subtitle}` : title)}
      accessibilityHint={accessibilityHint}>
      {content}
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.touch + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  icon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  value: {
    flexShrink: 0,
  },
});

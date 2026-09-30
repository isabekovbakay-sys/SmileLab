import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, iconSize, layout, radius, spacing } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

import { AppText } from './AppText';
import { ChevronDown } from './icons';
import { PressableScale } from './PressableScale';

export interface AccordionItem {
  id: string;
  title: string;
  content: string;
}

/** Список вопросов: открыт один пункт за раз. */
export function Accordion({ items }: { items: AccordionItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <View style={styles.root}>
      {items.map((item, index) => {
        const open = item.id === openId;
        return (
          <View key={item.id} style={index > 0 ? styles.divider : null}>
            <PressableScale
              scaleTo={0.99}
              onPress={() => {
                hapticSelection();
                setOpenId(open ? null : item.id);
              }}
              accessibilityRole="button"
              accessibilityLabel={item.title}
              accessibilityState={{ expanded: open }}
              style={styles.header}>
              <AppText variant="title" style={styles.title}>
                {item.title}
              </AppText>
              <View style={open ? styles.chevronOpen : null}>
                <ChevronDown size={iconSize.md} color={colors.textSecondary} />
              </View>
            </PressableScale>
            {open ? (
              <AppText variant="body" color="textSecondary" style={styles.content}>
                {item.content}
              </AppText>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  divider: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  header: {
    minHeight: layout.touch + spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    flex: 1,
  },
  chevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
});

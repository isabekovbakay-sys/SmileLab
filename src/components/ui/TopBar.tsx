import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useI18n } from '@/i18n';
import { colors, layout, spacing } from '@/theme';

import { AppText } from './AppText';
import { IconButton } from './IconButton';
import { ChevronLeft } from './icons';
import { ScreenContainer } from './ScreenContainer';

interface TopBarProps {
  title?: string;
  onBack?: () => void;
  showBack?: boolean;
  right?: ReactNode;
  /**
   * Прозрачная шапка поверх героя. С scrollY фон и заголовок проявляются при прокрутке.
   */
  overlay?: boolean;
  scrollY?: Animated.Value;
  /** С какой прокрутки шапка становится плотной. */
  solidAt?: number;
}

export function goBackOrHome() {
  if (router.canGoBack()) router.back();
  else router.replace('/');
}

export function TopBar({
  title,
  onBack,
  showBack = true,
  right,
  overlay = false,
  scrollY,
  solidAt = 160,
}: TopBarProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();

  const solid = scrollY
    ? scrollY.interpolate({ inputRange: [solidAt - 60, solidAt], outputRange: [0, 1], extrapolate: 'clamp' })
    : 1;

  return (
    <View
      style={[
        styles.bar,
        { paddingTop: insets.top, height: layout.topBarHeight + insets.top },
        overlay ? styles.overlay : styles.solid,
      ]}>
      {overlay ? (
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.fill, { opacity: solid }]} />
      ) : null}
      <ScreenContainer style={styles.row} outerStyle={styles.rowOuter}>
        <View style={styles.side}>
          {showBack ? (
            <IconButton
              icon={ChevronLeft}
              accessibilityLabel={t.a11y.back}
              onPress={onBack ?? goBackOrHome}
              variant={overlay ? 'onHero' : 'plain'}
            />
          ) : null}
        </View>
        <Animated.View style={[styles.titleWrap, overlay ? { opacity: solid } : null]}>
          {title ? (
            <AppText variant="title" numberOfLines={1} align="center" accessibilityRole="header">
              {title}
            </AppText>
          ) : null}
        </Animated.View>
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </ScreenContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    zIndex: 10,
  },
  rowOuter: {
    flex: 1,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xs,
  },
  solid: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  fill: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  side: {
    width: layout.touch + spacing.xs,
    flexDirection: 'row',
  },
  sideRight: {
    justifyContent: 'flex-end',
  },
  titleWrap: {
    flex: 1,
    paddingHorizontal: spacing.xxs,
  },
});

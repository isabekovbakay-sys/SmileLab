import { useEffect, useState } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePresence } from '@/hooks/usePresence';
import { useI18n } from '@/i18n';
import { useToast, type ToastMessage } from '@/state/ToastProvider';
import { colors, iconSize, layout, motion, radius, shadows, spacing } from '@/theme';

import { AppText } from './AppText';
import { CircleAlert, CircleCheck, Info } from './icons';

/** Тосты показываются сверху, чтобы не перекрывать кнопки внизу экрана. */
export function ToastHost() {
  const { t } = useI18n();
  const { toast, hideToast } = useToast();
  const insets = useSafeAreaInsets();
  const { mounted, progress } = usePresence(toast !== null);
  // Последний тост остаётся на экране, пока играет анимация скрытия.
  const [shown, setShown] = useState<ToastMessage | null>(toast);
  if (toast && toast !== shown) setShown(toast);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => hideToast(toast.id), motion.toastMs);
    return () => clearTimeout(timer);
  }, [toast, hideToast]);

  if (!mounted || !shown) return null;

  const Icon = shown.tone === 'error' ? CircleAlert : shown.tone === 'success' ? CircleCheck : Info;
  const iconColor = shown.tone === 'error' ? colors.accent : shown.tone === 'success' ? colors.textOnHeroMuted : colors.textOnHero;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          top: insets.top + spacing.xs,
          opacity: progress,
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-spacing.lg, 0] }) }],
        },
      ]}>
      <Pressable
        onPress={() => hideToast()}
        accessibilityRole="alert"
        accessibilityLiveRegion="assertive"
        accessibilityHint={t.a11y.dismissToast}
        style={styles.toast}>
        <Icon size={iconSize.md} color={iconColor} />
        <AppText variant="bodySm" color="textOnHero" style={styles.text}>
          {shown.message}
        </AppText>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: layout.gutter,
    right: layout.gutter,
    alignItems: 'center',
    zIndex: 100,
    elevation: 100,
  },
  toast: {
    width: '100%',
    maxWidth: layout.maxContentWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: layout.touch,
    ...shadows.floating,
  },
  text: {
    flex: 1,
  },
});

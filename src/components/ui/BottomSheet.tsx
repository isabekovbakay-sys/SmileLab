import type { ReactNode } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { usePresence } from '@/hooks/usePresence';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, shadows, spacing } from '@/theme';

import { AppText } from './AppText';
import { Button } from './Button';
import type { IconComponent } from './icons';

const SHEET_OFFSET = 480;

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Нижний лист поверх экрана. Системная «Назад» и тап по фону закрывают его. */
export function BottomSheet({ visible, onClose, children }: BottomSheetProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { mounted, progress } = usePresence(visible);
  if (!mounted) return null;

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={onClose}>
      <View style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.scrim, { opacity: progress }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t.common.close}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            styles.sheet,
            {
              paddingBottom: insets.bottom + spacing.lg,
              transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [SHEET_OFFSET, 0] }) }],
            },
          ]}>
          <View style={styles.handle} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  tone?: 'default' | 'danger';
  icon?: IconComponent;
  loading?: boolean;
}

/** Подтверждение действия в нижнем листе вместо системного alert(). */
export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  tone = 'default',
  icon: Icon,
  loading,
}: ConfirmSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onCancel}>
      <View style={styles.confirm}>
        {Icon ? (
          <View style={[styles.confirmIcon, tone === 'danger' ? styles.confirmIconDanger : null]}>
            <Icon size={iconSize.xl} color={tone === 'danger' ? colors.error : colors.hero} />
          </View>
        ) : null}
        <AppText variant="h2" accessibilityRole="header">
          {title}
        </AppText>
        {message ? (
          <AppText variant="body" color="textSecondary">
            {message}
          </AppText>
        ) : null}
        <View style={styles.actions}>
          <Button
            label={confirmLabel}
            onPress={onConfirm}
            loading={loading}
            variant={tone === 'danger' ? 'danger' : 'primary'}
          />
          <Button label={cancelLabel} onPress={onCancel} variant="ghost" disabled={loading} />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  scrim: {
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.sm,
    width: '100%',
    maxWidth: layout.maxContentWidth,
    alignSelf: 'center',
    ...shadows.floating,
  },
  handle: {
    alignSelf: 'center',
    width: spacing.xxxl,
    height: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
    marginBottom: spacing.md,
  },
  confirm: {
    gap: spacing.sm,
  },
  confirmIcon: {
    width: layout.touch + spacing.xs,
    height: layout.touch + spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxs,
  },
  confirmIconDanger: {
    backgroundColor: colors.errorSoft,
  },
  actions: {
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
});

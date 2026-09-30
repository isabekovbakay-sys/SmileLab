import { router, type Href } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useEffect } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandBackdrop } from '@/components/brand/BrandBackdrop';
import { Logo } from '@/components/brand/Logo';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { ArrowRight, CalendarPlus, Phone, X } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useContactActions } from '@/hooks/useContactActions';
import { restoreStatusBar } from '@/hooks/useStatusBarStyle';
import { usePresence } from '@/hooks/usePresence';
import { useI18n } from '@/i18n';
import { useBooking } from '@/state/BookingProvider';
import { useMenu } from '@/state/MenuProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { Language } from '@/types/domain';
import { hapticSelection } from '@/utils/haptics';

/** Полноэкранное меню (кнопка ☰). Системная «Назад» закрывает его. */
export function MenuOverlay() {
  const { t, language, setLanguage } = useI18n();
  const { open, closeMenu } = useMenu();
  const { start } = useBooking();
  const contact = useContactActions();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { mounted, progress } = usePresence(open);
  const compact = height < layout.shortScreen;

  useEffect(() => {
    if (open) setStatusBarStyle('light', true);
  }, [open]);

  if (!mounted) return null;

  const items: { label: string; href: Href }[] = [
    { label: t.menu.home, href: '/' },
    { label: t.menu.services, href: '/services' },
    { label: t.menu.appointments, href: '/appointments' },
    { label: t.menu.about, href: '/about' },
    { label: t.menu.contacts, href: '/contact' },
    { label: t.menu.profile, href: '/profile' },
  ];

  const close = () => {
    restoreStatusBar();
    closeMenu();
  };

  const go = (href: Href) => {
    close();
    router.navigate(href);
  };

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent navigationBarTranslucent onRequestClose={close}>
      <Animated.View
        accessibilityViewIsModal
        style={[
          styles.root,
          {
            opacity: progress,
            transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [-spacing.lg, 0] }) }],
          },
        ]}>
        <BrandBackdrop variant="deep" />
        <View style={[styles.top, { paddingTop: insets.top + spacing.xs }]}>
          <Logo tone="light" />
          <IconButton icon={X} accessibilityLabel={t.a11y.closeMenu} onPress={close} variant="onHero" testID="menu-close" />
        </View>

        <ScrollView style={styles.flex} contentContainerStyle={styles.items} showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <PressableScale
              key={item.label}
              onPress={() => go(item.href)}
              accessibilityRole="link"
              accessibilityLabel={item.label}
              scaleTo={0.98}
              style={[styles.item, compact ? styles.itemCompact : null]}>
              <AppText variant={compact ? 'h3' : 'h2'} color="textOnHero" style={styles.flex}>
                {item.label}
              </AppText>
              <ArrowRight size={iconSize.md} color={colors.textOnHeroMuted} />
            </PressableScale>
          ))}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
          <View style={styles.languageRow}>
            <AppText variant="overline" color="textOnHeroMuted">
              {t.menu.language}
            </AppText>
            <View style={styles.languages} accessibilityRole="radiogroup">
              {(['ky', 'ru'] as Language[]).map((lang) => {
                const selected = lang === language;
                return (
                  <PressableScale
                    key={lang}
                    onPress={() => {
                      hapticSelection();
                      setLanguage(lang);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    accessibilityLabel={t.languages[lang]}
                    style={[styles.langChip, selected ? styles.langChipSelected : null]}>
                    <AppText variant="caption" color={selected ? 'hero' : 'textOnHero'}>
                      {t.languages[lang]}
                    </AppText>
                  </PressableScale>
                );
              })}
            </View>
          </View>
          <Button
            label={t.common.bookVisit}
            icon={CalendarPlus}
            variant="accent"
            onPress={() => {
              close();
              router.push(start());
            }}
          />
          <Button
            label={contact.phoneLabel}
            icon={Phone}
            variant="onHeroOutline"
            size="md"
            accessibilityLabel={`${t.a11y.callClinic}, ${contact.phoneLabel}`}
            onPress={contact.call}
          />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.heroDeep,
  },
  flex: {
    flex: 1,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: layout.gutter,
    paddingRight: spacing.xs,
    paddingBottom: spacing.xs,
  },
  items: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.xs,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: layout.touch + spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.heroLight,
  },
  itemCompact: {
    minHeight: layout.touch + spacing.xxs,
  },
  footer: {
    paddingHorizontal: layout.gutter,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  languages: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  langChip: {
    minHeight: layout.touch - spacing.xxs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.heroLine,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipSelected: {
    backgroundColor: colors.white,
    borderColor: colors.white,
  },
});

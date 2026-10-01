import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import { CalendarDays, ClipboardList, House, User, type IconComponent } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useAppointmentGroups } from '@/hooks/useAppointmentGroups';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, shadows, spacing } from '@/theme';
import { hapticSelection } from '@/utils/haptics';

type TabName = 'index' | 'services' | 'appointments' | 'profile';

const ICONS: Record<TabName, IconComponent> = {
  index: House,
  services: ClipboardList,
  appointments: CalendarDays,
  profile: User,
};

/** Свой таб-бар: иконки lucide, зона нажатия ≥ 48dp, точка у «Записей», если есть предстоящая запись. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { t } = useI18n();
  const insets = useSafeAreaInsets();
  const { upcoming } = useAppointmentGroups();

  const labels: Record<TabName, string> = {
    index: t.tabs.home,
    services: t.tabs.services,
    appointments: t.tabs.appointments,
    profile: t.tabs.profile,
  };

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, spacing.xs) }]} accessibilityRole="tablist">
      {state.routes.map((route, index) => {
        const name = route.name as TabName;
        const Icon = ICONS[name];
        if (!Icon) return null;
        const focused = state.index === index;
        const hasDot = name === 'appointments' && upcoming.length > 0;
        const color = focused ? colors.hero : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            hapticSelection();
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <PressableScale
            key={route.key}
            testID={`tab-${name}`}
            onPress={onPress}
            scaleTo={0.94}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={hasDot ? `${labels[name]}, ${t.a11y.upcomingDot}` : labels[name]}
            style={styles.tab}>
            <View style={[styles.iconWrap, focused ? styles.iconWrapActive : null]}>
              <Icon size={iconSize.lg} color={color} strokeWidth={focused ? 2.3 : 1.9} />
              {hasDot ? <View style={styles.dot} /> : null}
            </View>
            <AppText variant="tab" color={focused ? 'hero' : 'textMuted'} numberOfLines={1}>
              {labels[name]}
            </AppText>
          </PressableScale>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xxs,
    ...shadows.bar,
  },
  tab: {
    flex: 1,
    minHeight: layout.tabBarHeight - spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: layout.touch + spacing.md,
    height: spacing.xxl,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: colors.surfaceTinted,
  },
  dot: {
    position: 'absolute',
    top: spacing.xxs,
    right: spacing.md,
    width: spacing.xs + 1,
    height: spacing.xs + 1,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
    borderWidth: 1.5,
    borderColor: colors.surface,
  },
});

import { StyleSheet, View } from 'react-native';

import { TelegramGlyph, WhatsAppGlyph } from '@/components/brand/ContactGlyphs';
import { AppText } from '@/components/ui/AppText';
import { MapPin, Phone, type IconComponent } from '@/components/ui/icons';
import { PressableScale } from '@/components/ui/PressableScale';
import { useContactActions } from '@/hooks/useContactActions';
import { useI18n } from '@/i18n';
import { colors, iconSize, layout, radius, spacing, type ColorToken } from '@/theme';

interface Action {
  key: string;
  label: string;
  a11y: string;
  icon: IconComponent;
  color: ColorToken;
  onPress: () => void;
}

/** Четыре быстрых действия под героем: связь с клиникой без прокрутки. */
export function QuickActions() {
  const { t } = useI18n();
  const contact = useContactActions();
  const actions: Action[] = [
    { key: 'call', label: t.home.quickCall, a11y: t.a11y.callClinic, icon: Phone, color: 'hero', onPress: contact.call },
    {
      key: 'whatsapp',
      label: t.home.quickWhatsApp,
      a11y: t.a11y.whatsappClinic,
      icon: WhatsAppGlyph,
      color: 'brandWhatsApp',
      onPress: () => contact.whatsapp(t.home.askMessage),
    },
    {
      key: 'telegram',
      label: t.home.quickTelegram,
      a11y: t.a11y.telegramClinic,
      icon: TelegramGlyph,
      color: 'brandTelegram',
      onPress: () => contact.telegram(t.home.askMessage),
    },
    {
      key: 'address',
      label: t.home.quickAddress,
      a11y: t.a11y.addressClinic,
      icon: MapPin,
      color: 'hero',
      onPress: contact.open2gis,
    },
  ];

  return (
    <View style={styles.row}>
      {actions.map(({ key, label, a11y, icon: Icon, color, onPress }) => (
        <PressableScale
          key={key}
          testID={`quick-${key}`}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={a11y}
          style={styles.tile}>
          <View style={styles.icon}>
            <Icon size={iconSize.lg} color={colors[color]} strokeWidth={2} />
          </View>
          <AppText variant="caption" align="center" numberOfLines={1} maxFontSizeMultiplier={1.2}>
            {label}
          </AppText>
        </PressableScale>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  tile: {
    flex: 1,
    minHeight: layout.touch * 2,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xxs,
  },
  icon: {
    width: layout.iconTile,
    height: layout.iconTile,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { Monogram } from '@/components/brand/Monogram';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { AppText } from '@/components/ui/AppText';
import { ConfirmSheet } from '@/components/ui/BottomSheet';
import { Card } from '@/components/ui/Card';
import { CalendarDays, ChevronRight, Info, Lock, MapPin, Trash2, User } from '@/components/ui/icons';
import { ListRow } from '@/components/ui/ListRow';
import { PressableScale } from '@/components/ui/PressableScale';
import { Segmented } from '@/components/ui/Selection';
import { TabHeader } from '@/components/ui/TabHeader';
import { useI18n } from '@/i18n';
import { useAppointments } from '@/state/AppointmentsProvider';
import { useProfile } from '@/state/ProfileProvider';
import { useToast } from '@/state/ToastProvider';
import { colors, iconSize, layout, radius, spacing } from '@/theme';
import type { Language } from '@/types/domain';
import { formatInternationalPhone } from '@/utils/phone';

/** Профиль и настройки: личные данные, язык, ссылки, удаление данных, версия. */
export default function ProfileScreen() {
  const { t, language, setLanguage } = useI18n();
  const { profile, clearProfile } = useProfile();
  const { clearAll } = useAppointments();
  const { showToast } = useToast();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const hasProfile = Boolean(profile.name || profile.phone);
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const deleteData = async () => {
    setDeleting(true);
    await Promise.all([clearProfile(), clearAll()]);
    setDeleting(false);
    setConfirming(false);
    showToast(t.profile.deleted, 'success');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <TabHeader title={t.profile.title} />
      <View style={styles.body}>
        <PressableScale
          testID="profile-personal"
          onPress={() => router.push('/profile-edit')}
          accessibilityRole="button"
          accessibilityLabel={`${t.profile.personal}. ${hasProfile ? profile.name : t.profile.personalEmpty}`}
          style={styles.personal}>
          {profile.name ? (
            <Monogram id={profile.phone || profile.name} name={profile.name} size={layout.touch + spacing.xs} />
          ) : (
            <View style={styles.avatar}>
              <User size={iconSize.lg} color={colors.hero} />
            </View>
          )}
          <View style={styles.flex}>
            <AppText variant="caption" color="textSecondary">
              {t.profile.personal}
            </AppText>
            {hasProfile ? (
              <>
                <AppText variant="title">{profile.name}</AppText>
                {profile.phone ? (
                  <AppText variant="bodySm" color="textSecondary">
                    {formatInternationalPhone(profile.phone)}
                  </AppText>
                ) : null}
              </>
            ) : (
              <AppText variant="bodySm">{t.profile.personalEmpty}</AppText>
            )}
          </View>
          <ChevronRight size={iconSize.md} color={colors.textMuted} />
        </PressableScale>

        <View style={styles.section}>
          <AppText variant="overline" color="textSecondary">
            {t.profile.language}
          </AppText>
          <Segmented<Language>
            testID="profile-language"
            value={language}
            onChange={setLanguage}
            options={[
              { value: 'ky', label: t.languages.ky },
              { value: 'ru', label: t.languages.ru },
            ]}
          />
        </View>

        <Card padded={false}>
          <ListRow icon={CalendarDays} title={t.profile.myAppointments} onPress={() => router.navigate('/appointments')} />
          <ListRow divider icon={MapPin} title={t.profile.contacts} onPress={() => router.push('/contact')} />
          <ListRow divider icon={Info} title={t.profile.about} onPress={() => router.push('/about')} />
          <ListRow divider icon={Lock} title={t.profile.privacy} onPress={() => router.push('/privacy')} />
        </Card>

        <Card padded={false}>
          <ListRow
            testID="profile-delete"
            icon={Trash2}
            iconBackground="errorSoft"
            tone="danger"
            title={t.profile.deleteData}
            chevron={false}
            onPress={() => setConfirming(true)}
          />
        </Card>

        <DemoNotice compact />

        <AppText variant="caption" color="textMuted" align="center">
          {t.profile.version(version)}
        </AppText>
      </View>

      <ConfirmSheet
        visible={confirming}
        icon={Trash2}
        tone="danger"
        title={t.profile.deleteTitle}
        message={t.profile.deleteText}
        confirmLabel={t.profile.deleteConfirm}
        cancelLabel={t.common.cancel}
        loading={deleting}
        onConfirm={deleteData}
        onCancel={() => setConfirming(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  body: {
    paddingHorizontal: layout.gutter,
    gap: spacing.lg,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  personal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  avatar: {
    width: layout.touch + spacing.xs,
    height: layout.touch + spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceTinted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    gap: spacing.xs,
  },
});

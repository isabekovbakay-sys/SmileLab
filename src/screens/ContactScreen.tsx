import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AddressBlock, ContactList, HoursTable, PaymentMethods } from '@/components/domain/ClinicInfo';
import { ClinicStatusLine } from '@/components/domain/ClinicStatusLine';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { AppText } from '@/components/ui/AppText';
import { TopBar } from '@/components/ui/TopBar';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { useI18n } from '@/i18n';
import { colors, layout, spacing } from '@/theme';

export default function ContactScreen() {
  const { t } = useI18n();
  return (
    <View style={styles.screen}>
      <TopBar title={t.contacts.title} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ScreenContainer padded style={styles.content}>
          <ContactList />
          <Section title={t.contacts.address}>
            <AddressBlock />
          </Section>
          <Section title={t.contacts.hours}>
            <ClinicStatusLine />
            <HoursTable />
          </Section>
          <Section title={t.contacts.payment}>
            <PaymentMethods />
          </Section>
          <DemoNotice compact />
        </ScreenContainer>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="h3" accessibilityRole="header">
        {title}
      </AppText>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingTop: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
});

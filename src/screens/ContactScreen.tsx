import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AddressBlock, ContactList, HoursTable, PaymentMethods } from '@/components/domain/ClinicInfo';
import { ClinicStatusLine } from '@/components/domain/ClinicStatusLine';
import { DemoNotice } from '@/components/domain/DemoNotice';
import { AppText } from '@/components/ui/AppText';
import { TopBar } from '@/components/ui/TopBar';
import { useI18n } from '@/i18n';
import { colors, layout, spacing } from '@/theme';

export default function ContactScreen() {
  const { t } = useI18n();
  return (
    <View style={styles.screen}>
      <TopBar title={t.contacts.title} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
    padding: layout.gutter,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
    width: '100%',
    maxWidth: layout.maxContentWidth + layout.gutter * 2,
    alignSelf: 'center',
  },
  section: {
    gap: spacing.sm,
  },
});

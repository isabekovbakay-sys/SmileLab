import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/navigation/TabBar';
import { useSettings } from '@/state/SettingsProvider';
import { colors } from '@/theme';

export default function TabsLayout() {
  const { onboardingDone } = useSettings();
  if (!onboardingDone) return <Redirect href="/onboarding" />;

  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.background } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="services" />
      <Tabs.Screen name="appointments" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

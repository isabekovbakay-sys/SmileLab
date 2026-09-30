import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { MenuOverlay } from '@/components/navigation/MenuOverlay';
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary';
import { ToastHost } from '@/components/ui/Toast';
import { AppProviders } from '@/state/AppProviders';
import { useSettings } from '@/state/SettingsProvider';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({ Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold });
  return (
    <AppProviders>
      <AppShell fontsReady={fontsLoaded || Boolean(fontError)} />
    </AppProviders>
  );
}

/** Сплэш не скрывается, пока не загружены шрифты и настройки (язык, онбординг). */
function AppShell({ fontsReady }: { fontsReady: boolean }) {
  const { ready } = useSettings();
  const appReady = fontsReady && ready;

  useEffect(() => {
    if (appReady) SplashScreen.hideAsync().catch(() => undefined);
  }, [appReady]);

  if (!appReady) return null;

  return (
    <AppErrorBoundary>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: colors.background },
        }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade', gestureEnabled: false }} />
        <Stack.Screen name="booking" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
      </Stack>
      <MenuOverlay />
      <ToastHost />
    </AppErrorBoundary>
  );
}

import { Stack } from 'expo-router';

import { colors } from '@/theme';

/** Свой Stack записи: системная «Назад» идёт по шагам. */
export default function BookingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}>
      <Stack.Screen name="success" options={{ animation: 'fade', gestureEnabled: false }} />
    </Stack>
  );
}

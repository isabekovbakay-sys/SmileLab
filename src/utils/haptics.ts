import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const enabled = Platform.OS !== 'web';

/** Лёгкий отклик на выбор (чипы, слоты, вкладки). Ошибки тактильного API игнорируются. */
export function hapticSelection(): void {
  if (enabled) Haptics.selectionAsync().catch(() => undefined);
}

export function hapticImpact(): void {
  if (enabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
}

export function hapticSuccess(): void {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
}

export function hapticWarning(): void {
  if (enabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
}

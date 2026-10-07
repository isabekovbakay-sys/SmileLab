import AsyncStorage from '@react-native-async-storage/async-storage';

/** JSON-обёртка над AsyncStorage. Ошибки хранилища не роняют приложение. */
export const STORAGE_PREFIX = 'smilelab:';
const PREFIX = STORAGE_PREFIX;

export const storageKeys = {
  settings: 'settings.v1',
  profile: 'profile.v1',
  appointments: 'appointments.v1',
} as const;

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function setJSON(key: string, value: unknown): Promise<boolean> {
  try {
    await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function removeKeys(keys: string[]): Promise<void> {
  try {
    await AsyncStorage.multiRemove(keys.map((k) => PREFIX + k));
  } catch {
    // Нечего делать: данные останутся до следующей попытки.
  }
}

/** Все ключи AsyncStorage этого приложения (с префиксом). */
export async function listAppKeys(): Promise<string[]> {
  try {
    return (await AsyncStorage.getAllKeys()).filter((key) => key.startsWith(PREFIX));
  } catch {
    return [];
  }
}

/** Удалить ключи как есть (полные имена, вместе с префиксом). */
export async function removeRawKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) return;
  try {
    await AsyncStorage.multiRemove(keys);
  } catch {
    // Повторим при следующем удалении.
  }
}

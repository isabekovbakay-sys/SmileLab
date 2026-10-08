import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { getJSON, removeKeys, setJSON } from './storage';

/**
 * Защищённое хранилище для личных данных (имя, телефон, e-mail) — Android Keystore.
 * В web SecureStore нет: там (только для проверки вёрстки) данные лежат в обычном хранилище.
 */
const secureAvailable = Platform.OS !== 'web';

/** Ключи SecureStore: только латиница, цифры, «.», «-», «_». */
export const secureKeys = {
  profile: 'smilelab.profile.v1',
} as const;

export async function getSecureJSON<T>(key: string, fallback: T): Promise<T> {
  if (!secureAvailable) return getJSON(`secure.${key}`, fallback);
  try {
    const raw = await SecureStore.getItemAsync(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function setSecureJSON(key: string, value: unknown): Promise<boolean> {
  if (!secureAvailable) return setJSON(`secure.${key}`, value);
  try {
    await SecureStore.setItemAsync(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export async function deleteSecure(keys: string[]): Promise<void> {
  if (!secureAvailable) {
    await removeKeys(keys.map((k) => `secure.${k}`));
    return;
  }
  await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key).catch(() => undefined)));
}

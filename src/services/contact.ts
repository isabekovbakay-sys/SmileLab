import { Linking } from 'react-native';

/**
 * Открывает внешнюю ссылку. Если ни основная, ни запасная ссылка не открылись,
 * возвращает false — вызывающий код показывает тост с контактом.
 */
export async function openExternal(url: string, fallbackUrl?: string): Promise<boolean> {
  try {
    await Linking.openURL(url);
    return true;
  } catch {
    if (!fallbackUrl) return false;
    try {
      await Linking.openURL(fallbackUrl);
      return true;
    } catch {
      return false;
    }
  }
}

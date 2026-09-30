/**
 * Переменные окружения сборки. Секретов в приложении нет: всё, что начинается
 * с EXPO_PUBLIC_, попадает в бандл и видно любому.
 */
export type DataSource = 'mock' | 'api';

const rawSource = process.env.EXPO_PUBLIC_DATA_SOURCE;
const rawApiUrl = process.env.EXPO_PUBLIC_API_BASE_URL;

export const appConfig = {
  dataSource: (rawSource === 'api' ? 'api' : 'mock') as DataSource,
  apiBaseUrl: rawApiUrl ? rawApiUrl.replace(/\/+$/, '') : null,
  /** Для съёмки скриншотов магазина: скрыть демо-плашки (EXPO_PUBLIC_STORE_SCREENSHOTS=1). */
  storeScreenshots: process.env.EXPO_PUBLIC_STORE_SCREENSHOTS === '1',
};

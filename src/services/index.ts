import { appConfig } from '../config/app';
import { createApiRepositories } from './api/apiRepositories';
import { createMockRepositories } from './mock/mockRepositories';
import type { Repositories } from './types';

/**
 * Единая точка переключения источника данных.
 * EXPO_PUBLIC_DATA_SOURCE=api + EXPO_PUBLIC_API_BASE_URL → сервер клиники, иначе — данные внутри приложения.
 */
export const repositories: Repositories =
  appConfig.dataSource === 'api' && appConfig.apiBaseUrl
    ? createApiRepositories(appConfig.apiBaseUrl)
    : createMockRepositories();

export { SlotUnavailableError, NotFoundError } from './types';
export type { AvailabilityQuery, RescheduleInput, Repositories } from './types';

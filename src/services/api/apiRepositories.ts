import type {
  Appointment,
  AppointmentRequest,
  ClinicContent,
  DayAvailability,
  Doctor,
  Service,
} from '../../types/domain';
import { NotFoundError, type AvailabilityQuery, type RescheduleInput, type Repositories } from '../types';
import { createHttpClient } from './httpClient';

/**
 * Реализация для собственного сервера клиники. Экраны не меняются — меняется только
 * источник данных (EXPO_PUBLIC_DATA_SOURCE=api, EXPO_PUBLIC_API_BASE_URL=https://…).
 *
 * Эндпоинты (JSON, формат — типы из src/types/domain.ts):
 *   GET  /services                  → Service[]
 *   GET  /services/:id              → Service | 404
 *   GET  /doctors                   → Doctor[]
 *   GET  /doctors/:id               → Doctor | 404
 *   GET  /clinic/content            → ClinicContent
 *   GET  /availability?serviceId=&doctorId=&branchId=&fromDate=&days=&excludeAppointmentId=
 *                                   → DayAvailability[]
 *   GET  /appointments              → Appointment[] (записи этого пациента)
 *   POST /appointments              ← AppointmentRequest → Appointment | 409 (время занято)
 *   POST /appointments/:id/cancel   → Appointment
 *   POST /appointments/:id/reschedule ← { date, time, doctorId, anyDoctor } → Appointment | 409
 */
export function createApiRepositories(baseUrl: string): Repositories {
  const http = createHttpClient(baseUrl);

  const required = <T>(value: T | null): T => {
    if (value === null) throw new NotFoundError();
    return value;
  };

  return {
    clinic: {
      listServices: async () => (await http.request<Service[]>('GET', '/services')) ?? [],
      getService: (id) => http.request<Service>('GET', `/services/${encodeURIComponent(id)}`),
      listDoctors: async () => (await http.request<Doctor[]>('GET', '/doctors')) ?? [],
      getDoctor: (id) => http.request<Doctor>('GET', `/doctors/${encodeURIComponent(id)}`),
      getContent: async () => required(await http.request<ClinicContent>('GET', '/clinic/content')),
    },

    schedule: {
      async getAvailability(query: AvailabilityQuery) {
        const params = new URLSearchParams({
          serviceId: query.serviceId,
          branchId: query.branchId,
          fromDate: query.fromDate,
          days: String(query.days),
        });
        if (query.doctorId) params.set('doctorId', query.doctorId);
        if (query.excludeAppointmentId) params.set('excludeAppointmentId', query.excludeAppointmentId);
        return (await http.request<DayAvailability[]>('GET', `/availability?${params.toString()}`)) ?? [];
      },
    },

    appointments: {
      list: async () => (await http.request<Appointment[]>('GET', '/appointments')) ?? [],
      create: async (request: AppointmentRequest) =>
        required(await http.request<Appointment>('POST', '/appointments', request)),
      cancel: async (id: string) =>
        required(await http.request<Appointment>('POST', `/appointments/${encodeURIComponent(id)}/cancel`)),
      reschedule: async (id: string, input: RescheduleInput) =>
        required(
          await http.request<Appointment>('POST', `/appointments/${encodeURIComponent(id)}/reschedule`, input),
        ),
      // Записи хранятся на сервере: локально чистить нечего.
      clearLocal: async () => undefined,
    },
  };
}

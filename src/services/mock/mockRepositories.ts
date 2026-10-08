import { clinicConfig, getBranch } from '../../config/clinic';
import { catalog } from '../../data/catalog';
import type { Appointment, AppointmentRequest } from '../../types/domain';
import { toClinicIso } from '../../utils/datetime';
import { getScheduleMode } from '../bookingDelivery';
import { getJSON, removeKeys, setJSON, storageKeys } from '../storage';
import {
  NotFoundError,
  SlotUnavailableError,
  type AvailabilityQuery,
  type RescheduleInput,
  type Repositories,
} from '../types';
import { computeAvailability, freeDoctorsAt, isTimeAvailable, type AvailabilityContext } from './availability';
import { hasLegacyPersonalFields, sanitizeAppointments, toStoredAppointment } from './sanitize';

/**
 * Работа без сервера: каталог клиники (src/data/clinic или демо — по сборке),
 * записи на телефоне (без телефона пациента и комментария).
 */

/** Искусственная задержка, чтобы видеть скелетоны и проверять состояния загрузки. */
const LATENCY_MS = 350;
const delay = (ms = LATENCY_MS) => new Promise<void>((resolve) => setTimeout(resolve, ms));

let idCounter = 0;
function createId(): string {
  idCounter += 1;
  return `local-${Date.now().toString(36)}-${idCounter.toString(36)}`;
}

export function createMockRepositories(): Repositories {
  let cache: Appointment[] | null = null;
  const { services, doctors, content } = catalog;

  async function loadAppointments(): Promise<Appointment[]> {
    if (!cache) {
      const raw = await getJSON<unknown>(storageKeys.appointments, []);
      cache = sanitizeAppointments(raw);
      // Старые версии хранили телефон и комментарий — переписываем без них.
      if (hasLegacyPersonalFields(raw)) await setJSON(storageKeys.appointments, cache);
    }
    return cache;
  }

  async function saveAppointments(list: Appointment[]): Promise<void> {
    cache = list.map(toStoredAppointment);
    await setJSON(storageKeys.appointments, cache);
  }

  async function context(branchId: string): Promise<AvailabilityContext> {
    return {
      services,
      doctors,
      branch: getBranch(branchId),
      appointments: await loadAppointments(),
      now: Date.now(),
      minLeadMinutes: clinicConfig.booking.minLeadMinutes,
      utcOffsetMinutes: clinicConfig.utcOffsetMinutes,
      isDemo: clinicConfig.isDemo,
      mode: getScheduleMode(),
    };
  }

  /**
   * Повторная проверка времени перед записью. Возвращает врача, за которым закреплено время:
   * в режиме «свободное время» при «любом враче» — первого свободного; в режиме «желаемое время» —
   * выбранного пациентом (по возможности) или пустую строку.
   */
  async function claimSlot(
    input: { serviceId: string; branchId: string; date: string; time: string; doctorId: string; anyDoctor?: boolean },
    excludeAppointmentId?: string,
  ): Promise<string> {
    const ctx = await context(input.branchId);
    const query = {
      serviceId: input.serviceId,
      doctorId: input.anyDoctor ? null : input.doctorId,
      excludeAppointmentId,
    };
    if (ctx.mode === 'request') {
      if (!isTimeAvailable(input.date, input.time, query, ctx)) throw new SlotUnavailableError();
      return input.anyDoctor ? '' : input.doctorId;
    }
    const free = freeDoctorsAt(input.date, input.time, query, ctx);
    if (free.length === 0) throw new SlotUnavailableError();
    if (!input.anyDoctor) return input.doctorId;
    return free.includes(input.doctorId) ? input.doctorId : free[0]!;
  }

  return {
    clinic: {
      async listServices() {
        await delay();
        return services;
      },
      async getService(id) {
        await delay();
        return services.find((s) => s.id === id) ?? null;
      },
      async listDoctors() {
        await delay();
        return doctors;
      },
      async getDoctor(id) {
        await delay();
        return doctors.find((d) => d.id === id) ?? null;
      },
      async getContent() {
        await delay();
        return content;
      },
    },

    schedule: {
      async getAvailability(query: AvailabilityQuery) {
        await delay();
        return computeAvailability(query, await context(query.branchId));
      },
    },

    appointments: {
      async list() {
        await delay(150);
        return [...(await loadAppointments())];
      },

      async create(request: AppointmentRequest) {
        await delay();
        const doctorId = await claimSlot(request);
        const now = new Date().toISOString();
        const { patient, comment: _comment, ...rest } = request;
        const appointment: Appointment = {
          ...rest,
          patient: { name: patient.name },
          doctorId,
          id: createId(),
          status: 'requested',
          startsAt: toClinicIso(request.date, request.time, clinicConfig.utcOffsetMinutes),
          createdAt: now,
          updatedAt: now,
        };
        await saveAppointments([...(await loadAppointments()), appointment]);
        return appointment;
      },

      async cancel(id: string) {
        await delay();
        const list = await loadAppointments();
        const current = list.find((a) => a.id === id);
        if (!current) throw new NotFoundError();
        const updated: Appointment = { ...current, status: 'cancelled', updatedAt: new Date().toISOString() };
        await saveAppointments(list.map((a) => (a.id === id ? updated : a)));
        return updated;
      },

      async reschedule(id: string, input: RescheduleInput) {
        await delay();
        const list = await loadAppointments();
        const current = list.find((a) => a.id === id);
        if (!current) throw new NotFoundError();
        const doctorId = await claimSlot(
          { serviceId: current.serviceId, branchId: current.branchId, ...input },
          current.id,
        );
        const updated: Appointment = {
          ...current,
          date: input.date,
          time: input.time,
          doctorId,
          anyDoctor: input.anyDoctor ?? false,
          status: 'requested',
          startsAt: toClinicIso(input.date, input.time, clinicConfig.utcOffsetMinutes),
          updatedAt: new Date().toISOString(),
        };
        await saveAppointments(list.map((a) => (a.id === id ? updated : a)));
        return updated;
      },

      async clearLocal() {
        cache = [];
        await removeKeys([storageKeys.appointments]);
      },
    },
  };
}

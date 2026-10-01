import { getBranch, clinicConfig } from '../../config/clinic';
import { mockClinicContent } from '../../data/mock/clinicContent';
import { mockDoctors } from '../../data/mock/doctors';
import { mockServices } from '../../data/mock/services';
import type { Appointment, AppointmentRequest } from '../../types/domain';
import { toClinicIso } from '../../utils/datetime';
import { getJSON, setJSON, removeKeys, storageKeys } from '../storage';
import {
  SlotUnavailableError,
  NotFoundError,
  type AvailabilityQuery,
  type RescheduleInput,
  type Repositories,
} from '../types';
import { computeAvailability, freeDoctorsAt, type AvailabilityContext } from './availability';
import { sanitizeAppointments } from './sanitize';

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

  async function loadAppointments(): Promise<Appointment[]> {
    if (!cache) cache = sanitizeAppointments(await getJSON<unknown>(storageKeys.appointments, []));
    return cache;
  }

  async function saveAppointments(list: Appointment[]): Promise<void> {
    cache = list;
    await setJSON(storageKeys.appointments, list);
  }

  async function context(branchId: string): Promise<AvailabilityContext> {
    return {
      services: mockServices,
      doctors: mockDoctors,
      branch: getBranch(branchId),
      appointments: await loadAppointments(),
      now: Date.now(),
      minLeadMinutes: clinicConfig.booking.minLeadMinutes,
      utcOffsetMinutes: clinicConfig.utcOffsetMinutes,
      isDemo: clinicConfig.isDemo,
    };
  }

  /** Повторная проверка слота. При «любом враче» возвращает назначенного врача. */
  async function claimSlot(
    input: { serviceId: string; branchId: string; date: string; time: string; doctorId: string; anyDoctor?: boolean },
    excludeAppointmentId?: string,
  ): Promise<string> {
    const ctx = await context(input.branchId);
    const free = freeDoctorsAt(
      input.date,
      input.time,
      { serviceId: input.serviceId, doctorId: input.anyDoctor ? null : input.doctorId, excludeAppointmentId },
      ctx,
    );
    if (free.length === 0) throw new SlotUnavailableError();
    if (!input.anyDoctor) return input.doctorId;
    return free.includes(input.doctorId) ? input.doctorId : free[0]!;
  }

  return {
    clinic: {
      async listServices() {
        await delay();
        return mockServices;
      },
      async getService(id) {
        await delay();
        return mockServices.find((s) => s.id === id) ?? null;
      },
      async listDoctors() {
        await delay();
        return mockDoctors;
      },
      async getDoctor(id) {
        await delay();
        return mockDoctors.find((d) => d.id === id) ?? null;
      },
      async getContent() {
        await delay();
        return mockClinicContent;
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
        const appointment: Appointment = {
          ...request,
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

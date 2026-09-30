import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { clinicConfig } from '../config/clinic';
import { track } from '../services/analytics';
import { repositories, type RescheduleInput } from '../services';
import type { Appointment, AppointmentRequest } from '../types/domain';
import { clinicTimestamp } from '../utils/datetime';

type Status = 'loading' | 'ready' | 'error';

interface AppointmentsContextValue {
  status: Status;
  appointments: Appointment[];
  /** Растёт после каждого изменения: экраны выбора времени перезапрашивают слоты. */
  version: number;
  reload: () => void;
  create: (request: AppointmentRequest) => Promise<Appointment>;
  cancel: (id: string) => Promise<Appointment>;
  reschedule: (id: string, input: RescheduleInput) => Promise<Appointment>;
  clearAll: () => Promise<void>;
}

const AppointmentsContext = createContext<AppointmentsContextValue | null>(null);

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ status: Status; appointments: Appointment[]; version: number }>({
    status: 'loading',
    appointments: [],
    version: 0,
  });
  const [loadToken, setLoadToken] = useState(0);

  useEffect(() => {
    let active = true;
    repositories.appointments.list().then(
      (appointments) => {
        if (active) setState((prev) => ({ ...prev, status: 'ready', appointments }));
      },
      () => {
        if (active) setState((prev) => ({ ...prev, status: 'error' }));
      },
    );
    return () => {
      active = false;
    };
  }, [loadToken]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, status: 'loading' }));
    setLoadToken((n) => n + 1);
  }, []);

  const upsert = useCallback((appointment: Appointment) => {
    setState((prev) => {
      const exists = prev.appointments.some((a) => a.id === appointment.id);
      const appointments = exists
        ? prev.appointments.map((a) => (a.id === appointment.id ? appointment : a))
        : [...prev.appointments, appointment];
      return { status: 'ready', appointments, version: prev.version + 1 };
    });
  }, []);

  const create = useCallback(
    async (request: AppointmentRequest) => {
      const appointment = await repositories.appointments.create(request);
      upsert(appointment);
      return appointment;
    },
    [upsert],
  );

  const cancel = useCallback(
    async (id: string) => {
      const appointment = await repositories.appointments.cancel(id);
      upsert(appointment);
      track('appointment_cancelled');
      return appointment;
    },
    [upsert],
  );

  const reschedule = useCallback(
    async (id: string, input: RescheduleInput) => {
      const appointment = await repositories.appointments.reschedule(id, input);
      upsert(appointment);
      track('appointment_rescheduled');
      return appointment;
    },
    [upsert],
  );

  const clearAll = useCallback(async () => {
    await repositories.appointments.clearLocal();
    setState((prev) => ({ status: 'ready', appointments: [], version: prev.version + 1 }));
  }, []);

  const value = useMemo(
    () => ({ ...state, reload, create, cancel, reschedule, clearAll }),
    [state, reload, create, cancel, reschedule, clearAll],
  );
  return <AppointmentsContext value={value}>{children}</AppointmentsContext>;
}

export function useAppointments(): AppointmentsContextValue {
  const context = use(AppointmentsContext);
  if (!context) throw new Error('useAppointments вне AppointmentsProvider');
  return context;
}

export function appointmentTimestamp(appointment: Appointment): number {
  return clinicTimestamp(appointment.date, appointment.time, clinicConfig.utcOffsetMinutes);
}

/** Предстоящие (по возрастанию) и история: отменённые и прошедшие (сначала новые). */
export function groupAppointments(appointments: Appointment[], now: number) {
  const upcoming: Appointment[] = [];
  const history: Appointment[] = [];
  for (const appointment of appointments) {
    if (appointment.status !== 'cancelled' && appointmentTimestamp(appointment) >= now) upcoming.push(appointment);
    else history.push(appointment);
  }
  upcoming.sort((a, b) => appointmentTimestamp(a) - appointmentTimestamp(b));
  history.sort((a, b) => appointmentTimestamp(b) - appointmentTimestamp(a));
  return { upcoming, history };
}

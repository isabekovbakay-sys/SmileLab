import type { Href } from 'expo-router';
import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

import { track } from '../services/analytics';
import type { Appointment, ClockTime, LocalDate } from '../types/domain';

export type BookingMode = 'new' | 'reschedule';
export type BookingStep = 'service' | 'datetime' | 'details';
/** id врача или 'any' — «Любой врач». */
export type DoctorChoice = string;
export const ANY_DOCTOR = 'any';

export interface BookingDraft {
  mode: BookingMode;
  /** Запись, которую переносим. */
  original: Appointment | null;
  serviceId: string | null;
  doctorChoice: DoctorChoice;
  /** Врач, к которому пациент пришёл со страницы врача: будет выбран по умолчанию. */
  preferredDoctorId: string | null;
  date: LocalDate | null;
  time: ClockTime | null;
  /** Врачи, свободные в выбранное время. */
  slotDoctorIds: string[];
  /** Растёт, когда слот оказался занят: экран времени перезапрашивает свободное время. */
  slotsNonce: number;
}

export interface StartBookingOptions {
  serviceId?: string;
  doctorId?: string;
  reschedule?: Appointment;
}

export const bookingRoutes: Record<BookingStep | 'success', Href> = {
  service: '/booking',
  datetime: '/booking/datetime',
  details: '/booking/details',
  success: '/booking/success',
};

const EMPTY_DRAFT: BookingDraft = {
  mode: 'new',
  original: null,
  serviceId: null,
  doctorChoice: ANY_DOCTOR,
  preferredDoctorId: null,
  date: null,
  time: null,
  slotDoctorIds: [],
  slotsNonce: 0,
};

interface BookingContextValue {
  draft: BookingDraft;
  steps: BookingStep[];
  /** Номер шага для заголовка «Шаг N из 3». */
  stepNumber: (step: BookingStep) => number;
  /** Сбрасывает черновик и возвращает маршрут первого экрана. */
  start: (options?: StartBookingOptions) => Href;
  update: (patch: Partial<BookingDraft>) => void;
  /** Куда идти после шага. null — шаг последний (действие выполняет экран). */
  routeAfter: (step: BookingStep) => Href | null;
}

const BookingContext = createContext<BookingContextValue | null>(null);

function stepsFor(mode: BookingMode): BookingStep[] {
  return mode === 'reschedule' ? ['datetime'] : ['service', 'datetime', 'details'];
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(EMPTY_DRAFT);

  const start = useCallback((options: StartBookingOptions = {}): Href => {
    if (options.reschedule) {
      const original = options.reschedule;
      setDraft({
        ...EMPTY_DRAFT,
        mode: 'reschedule',
        original,
        serviceId: original.serviceId,
        doctorChoice: original.anyDoctor ? ANY_DOCTOR : original.doctorId,
        preferredDoctorId: original.anyDoctor ? null : original.doctorId,
      });
      track('booking_started', { mode: 'reschedule' });
      return bookingRoutes.datetime;
    }
    setDraft({
      ...EMPTY_DRAFT,
      serviceId: options.serviceId ?? null,
      doctorChoice: options.doctorId ?? ANY_DOCTOR,
      preferredDoctorId: options.doctorId ?? null,
    });
    track('booking_started', { mode: 'new', from: options.serviceId ? 'service' : 'start' });
    // Со страницы услуги первым открывается шаг 2.
    return options.serviceId ? bookingRoutes.datetime : bookingRoutes.service;
  }, []);

  const update = useCallback((patch: Partial<BookingDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const value = useMemo<BookingContextValue>(() => {
    const currentSteps = stepsFor(draft.mode);
    return {
      draft,
      steps: currentSteps,
      stepNumber: (step) => currentSteps.indexOf(step) + 1,
      start,
      update,
      routeAfter: (step) => {
        const next = currentSteps[currentSteps.indexOf(step) + 1];
        return next ? bookingRoutes[next] : null;
      },
    };
  }, [draft, start, update]);

  return <BookingContext value={value}>{children}</BookingContext>;
}

export function useBooking(): BookingContextValue {
  const context = use(BookingContext);
  if (!context) throw new Error('useBooking вне BookingProvider');
  return context;
}

export { stepsFor as bookingStepsFor };
export type { BookingContextValue };

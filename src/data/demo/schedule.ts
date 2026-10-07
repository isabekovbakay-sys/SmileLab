import type { WeeklySchedule } from '../../types/domain';

/** ДЕМО-часы работы клиники (только демо-сборка). Реальные — в src/config/clinic.ts. */
export const demoWorkingHours: WeeklySchedule = {
  mon: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  tue: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  wed: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  thu: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  fri: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  sat: { hours: { start: '10:00', end: '16:00' }, breaks: [] },
  sun: { hours: null, breaks: [] },
};

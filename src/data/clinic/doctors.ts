import type { DaySchedule, Doctor, LocalizedText, WeeklySchedule } from '../../types/domain';

/**
 * ВРАЧИ КЛИНИКИ (подтверждены владельцем 08.10.2026).
 *
 * Как менять: имя и должность — на двух языках (должность одинаковая: «Стоматолог-терапевт»);
 * serviceIds — id услуг из src/data/clinic/services.ts; languages — языки приёма;
 * schedule — дни и часы приёма (hours: null — не принимает). Фото не нужны: показывается монограмма.
 */
const L = (ru: string, ky: string): LocalizedText => ({ ru, ky });

const off: DaySchedule = { hours: null, breaks: [] };
const day = (start: string, end: string, lunch = true): DaySchedule => ({
  hours: { start, end },
  breaks: lunch ? [{ start: '13:00', end: '14:00' }] : [],
});

const week = (partial: Partial<WeeklySchedule>): WeeklySchedule => ({
  mon: off,
  tue: off,
  wed: off,
  thu: off,
  fri: off,
  sat: off,
  sun: off,
  ...partial,
});

export const clinicDoctors: Doctor[] = [
  {
    id: 'aigerim',
    name: L('Айгерим А.', 'Айгерим А.'),
    role: L('Стоматолог-терапевт', 'Стоматолог-терапевт'),
    focus: L('Лечение кариеса и каналов, гигиена', 'Кариести жана каналдарды дарылоо, гигиена'),
    serviceIds: ['consultation', 'hygiene', 'caries', 'endo'],
    branchIds: ['main'],
    languages: ['ky', 'ru'],
    schedule: week({
      mon: day('09:00', '18:00'),
      tue: day('09:00', '18:00'),
      wed: day('09:00', '18:00'),
      thu: day('09:00', '18:00'),
      fri: day('09:00', '18:00'),
    }),
    slotMinutes: 30,
  },
  {
    id: 'bakyt',
    name: L('Бакыт С.', 'Бакыт С.'),
    role: L('Хирург-имплантолог', 'Хирург-имплантолог'),
    focus: L('Имплантация и удаление зубов', 'Имплантация жана тиш жулуу'),
    serviceIds: ['consultation', 'extraction', 'implant'],
    branchIds: ['main'],
    languages: ['ky', 'ru'],
    schedule: week({
      tue: day('10:00', '19:00'),
      thu: day('10:00', '19:00'),
      sat: day('10:00', '16:00', false),
    }),
    slotMinutes: 30,
  },
  {
    id: 'elena',
    name: L('Елена М.', 'Елена М.'),
    role: L('Стоматолог-ортопед', 'Стоматолог-ортопед'),
    focus: L('Коронки, виниры, коронки на имплантах', 'Коронкалар, винирлер, импланттагы коронкалар'),
    serviceIds: ['consultation', 'prosthetics', 'implant'],
    branchIds: ['main'],
    languages: ['ru'],
    schedule: week({
      mon: day('09:00', '19:00'),
      wed: day('09:00', '19:00'),
      fri: day('09:00', '19:00'),
    }),
    slotMinutes: 30,
  },
  {
    id: 'nurlan',
    name: L('Нурлан К.', 'Нурлан К.'),
    role: L('Ортодонт', 'Ортодонт'),
    focus: L('Брекеты и элайнеры для детей и взрослых', 'Балдар жана чоңдор үчүн брекеттер жана элайнерлер'),
    serviceIds: ['consultation', 'orthodontics'],
    branchIds: ['main'],
    languages: ['ky', 'ru'],
    schedule: week({
      mon: day('14:00', '19:00', false),
      wed: day('14:00', '19:00', false),
      sat: day('10:00', '16:00', false),
    }),
    slotMinutes: 30,
  },
];

import { demo } from '../data/demoGate';
import type { Branch, Language, WeeklySchedule } from '../types/domain';

/**
 * ДАННЫЕ КЛИНИКИ. Экраны берут телефоны, адрес, часы работы и юрлицо только отсюда.
 * Услуги и врачи — в src/data/clinic/, тексты главной — в src/data/clinic/content.ts.
 *
 * Правило: чего нет — оставьте null или пустую строку. Приложение спрячет кнопку
 * (например, «Открыть в 2ГИС» без адреса или Telegram без контакта) и не покажет заглушку.
 * Перед релизной сборкой scripts/release-check.ts проверит, что обязательное заполнено.
 */

/**
 * Демо-режим задаётся СБОРКОЙ, а не правкой кода:
 *   EXPO_PUBLIC_DEMO=1 — демо-сборка (профиль EAS "demo"): примерные услуги, врачи и часы, плашка «Демо»;
 *   иначе — релиз: только данные из этого файла и src/data/clinic/.
 */
const isDemo = process.env.EXPO_PUBLIC_DEMO === '1';

const closed = { hours: null, breaks: [] };

/**
 * ЧАСЫ РАБОТЫ — время клиники (Бишкек, UTC+6), 24 часа.
 * Рабочий день: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] }
 * Выходной:     { hours: null, breaks: [] }
 * Пока все дни выходные, приложение пишет «Часы работы уточняйте у администратора»,
 * а вместо выбора времени предлагает позвонить.
 */
const workingHours: WeeklySchedule = {
  mon: closed,
  tue: closed,
  wed: closed,
  thu: closed,
  fri: closed,
  sat: closed,
  sun: closed,
};

const branches: Branch[] = [
  {
    id: 'main',
    name: { ru: 'SmileLab', ky: 'SmileLab' },
    address: {
      cityId: 'bishkek',
      // Район: { ru: 'Октябрьский район', ky: 'Октябрь району' } или null.
      district: null,
      // Улица: { ru: 'ул. Токтогула', ky: 'Токтогул көчөсү' }. Без улицы и дома кнопки карт скрыты.
      street: null,
      // Дом: '100' или '100/1'.
      building: null,
      // Ориентир: { ru: 'напротив ЦУМа', ky: 'ЦУМдун каршысында' } или null.
      landmark: null,
    },
    // Координаты входа: { lat: 42.87, lng: 74.59 } — только точные (из 2ГИС или Google Maps), не выдумывать.
    coordinates: null,
    // Ссылка на карточку клиники в 2ГИС: откройте клинику в 2ГИС → «Поделиться» → скопируйте ссылку.
    twoGisUrl: null,
    workingHours: demo?.demoWorkingHours ?? workingHours,
  },
];

export type PaymentMethodId = 'cash' | 'card' | 'qr';
export type RequestChannel = 'whatsapp' | 'telegram';

export const clinicConfig = {
  name: 'SmileLab',
  isDemo,

  /**
   * ЮРЛИЦО — оператор персональных данных в политике конфиденциальности.
   * name: 'ОсОО «СмайлЛаб»' или 'ИП Асанов А. А.'; inn: 14 цифр ИНН; address: юридический адрес.
   */
  legal: {
    name: null as string | null,
    inn: null as string | null,
    address: null as string | null,
  },

  /**
   * КОНТАКТЫ — в формате +996XXXXXXXXX. Пустая строка — кнопка скрыта.
   * telegram: username — без «@» (надёжнее: открывает чат с готовым текстом);
   *           phone — если username нет. Оба пустые — Telegram скрыт везде.
   */
  contacts: {
    phone: '+996507597099',
    whatsapp: '+996507597099',
    telegram: {
      username: null as string | null,
      phone: '+996507597099' as string | null,
    },
    email: 'isabekovbakay@gmail.com',
  },

  branches,
  defaultBranchId: 'main',

  currency: 'KGS' as const,
  timezone: 'Asia/Bishkek',
  utcOffsetMinutes: 360,

  languages: ['ky', 'ru'] as Language[],
  fallbackLanguage: 'ru' as Language,

  // Способы оплаты в клинике: 'cash' — наличные, 'card' — карта, 'qr' — QR через приложение банка.
  paymentMethods: ['cash', 'card', 'qr'] as PaymentMethodId[],

  booking: {
    /** На сколько дней вперёд можно записаться. */
    horizonDays: 21,
    /** Сегодня — не раньше, чем через столько минут. */
    minLeadMinutes: 60,
    /** Куда уходит заявка, если нет сервера: 'whatsapp' или 'telegram'. */
    requestChannel: 'whatsapp' as RequestChannel,
  },
};

export type ClinicConfig = typeof clinicConfig;

export function getBranch(id: string = clinicConfig.defaultBranchId): Branch {
  return clinicConfig.branches.find((b) => b.id === id) ?? clinicConfig.branches[0]!;
}

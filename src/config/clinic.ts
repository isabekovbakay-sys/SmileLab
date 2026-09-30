import type { Branch, Language, WeeklySchedule } from '../types/domain';

/**
 * ВСЕ данные клиники — только здесь. Экраны читают телефоны, адрес и часы работы
 * исключительно из этого файла (через хуки и сервисы).
 *
 * ДЕМО: адрес, часы работы, врачи, услуги и цены — примеры (isDemo: true).
 * Перед публикацией замените их реальными и выставьте isDemo: false.
 * Контакты (телефон, WhatsApp, Telegram, e-mail) — настоящие.
 */

// ДЕМО-расписание. Замените реальными часами работы.
const workingHours: WeeklySchedule = {
  mon: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  tue: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  wed: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  thu: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  fri: { hours: { start: '09:00', end: '19:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
  sat: { hours: { start: '10:00', end: '16:00' }, breaks: [] },
  sun: { hours: null, breaks: [] },
};

const branches: Branch[] = [
  {
    id: 'main',
    name: { ru: 'SmileLab', ky: 'SmileLab' },
    address: {
      cityId: 'bishkek',
      // Точный адрес не указан: в приложении будет «Точный адрес уточняйте у администратора».
      district: null,
      street: null,
      building: null,
      landmark: null,
    },
    // Координаты не выдумываем: пока их нет, карта открывается поиском по названию.
    coordinates: null,
    workingHours,
  },
];

export type PaymentMethodId = 'cash' | 'card' | 'qr';
export type RequestChannel = 'whatsapp' | 'telegram';

export const clinicConfig = {
  name: 'SmileLab',
  /** true — демо-данные: плашка «Демо», заявки не отправляются автоматически. */
  isDemo: true,

  contacts: {
    phone: '+996507597099',
    whatsapp: '+996507597099',
    telegram: {
      /** @username без «@». Если появится — ссылки станут надёжнее и получат готовый текст. */
      username: null as string | null,
      phone: '+996507597099',
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

  paymentMethods: ['cash', 'card', 'qr'] as PaymentMethodId[],

  booking: {
    /** На сколько дней вперёд можно записаться. */
    horizonDays: 21,
    /** Сегодня — не раньше, чем через столько минут. */
    minLeadMinutes: 60,
    /** Куда уходит заявка, если нет сервера. */
    requestChannel: 'whatsapp' as RequestChannel,
  },

  media: {
    /**
     * Фоновое видео на главной: require('../../assets/video/hero.mp4') (лучше, ≤ 5 МБ),
     * 'https://…' (кэшируется) или null — тогда виден фирменный фон.
     */
    heroVideo: null as number | string | null,
  },
};

export type ClinicConfig = typeof clinicConfig;

export function getBranch(id: string = clinicConfig.defaultBranchId): Branch {
  return clinicConfig.branches.find((b) => b.id === id) ?? clinicConfig.branches[0]!;
}

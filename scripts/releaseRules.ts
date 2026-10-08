import type { ClinicConfig } from '../src/config/clinic';
import { hasPhone, hasStreetAddress, hasTelegram } from '../src/services/contactLinks';
import type { Doctor, Service } from '../src/types/domain';

/**
 * Правила релизной сборки. Возвращает список проблем на русском; пустой список — можно собирать.
 * Чистая функция: проверяется тестом на заполненных и пустых данных.
 */
export interface ReleaseInput {
  config: ClinicConfig;
  services: Service[];
  doctors: Doctor[];
  /**
   * Сборка для Google Play: юрлицо (оператор персональных данных) обязательно — без него
   * Play не примет политику конфиденциальности. Для APK по ссылке — только предупреждение.
   */
  store?: boolean;
}

export interface ReleaseReport {
  problems: string[];
  warnings: string[];
}

const CONFIG = 'src/config/clinic.ts';
const SERVICES = 'src/data/clinic/services.ts';
const DOCTORS = 'src/data/clinic/doctors.ts';

const filled = (value: string | null | undefined) => Boolean(value?.trim());

export function releaseProblems(input: ReleaseInput): string[] {
  return releaseReport(input).problems;
}

export function releaseReport({ config, services, doctors, store = false }: ReleaseInput): ReleaseReport {
  const problems: string[] = [];
  const warnings: string[] = [];
  const { contacts, legal } = config;
  const legalIssues: string[] = [];

  if (!hasPhone(contacts.phone)) problems.push(`Не указан телефон клиники (contacts.phone в ${CONFIG}).`);
  if (!filled(contacts.email)) problems.push(`Не указан e-mail клиники (contacts.email в ${CONFIG}).`);
  if (config.booking.requestChannel === 'whatsapp' && !hasPhone(contacts.whatsapp)) {
    problems.push(`Заявки уходят в WhatsApp, но не указан номер WhatsApp (contacts.whatsapp в ${CONFIG}).`);
  }
  if (config.booking.requestChannel === 'telegram') {
    if (!hasTelegram(contacts.telegram)) {
      problems.push(`Заявки уходят в Telegram, но Telegram не указан (contacts.telegram в ${CONFIG}).`);
    } else if (!filled(contacts.telegram.username)) {
      problems.push(
        `Заявки уходят в Telegram: укажите contacts.telegram.username — по номеру Telegram не подставляет текст заявки.`,
      );
    }
  }

  if (!filled(legal.name)) legalIssues.push(`Не указано юрлицо — название ОсОО или ИП (legal.name в ${CONFIG}).`);
  if (!filled(legal.inn)) {
    legalIssues.push(`Не указан ИНН юрлица (legal.inn в ${CONFIG}).`);
  } else if (!/^\d{14}$/.test(legal.inn!.trim())) {
    problems.push(`ИНН должен состоять из 14 цифр (legal.inn в ${CONFIG}).`);
  }
  if (!filled(legal.address)) legalIssues.push(`Не указан юридический адрес (legal.address в ${CONFIG}).`);
  (store ? problems : warnings).push(...legalIssues);

  if (config.branches.length === 0) problems.push(`Нет ни одного филиала (branches в ${CONFIG}).`);
  for (const branch of config.branches) {
    const where = `филиал «${branch.name.ru}»`;
    if (!hasStreetAddress(branch.address)) {
      problems.push(`Не указан адрес: улица и дом (${where}, address.street и address.building в ${CONFIG}).`);
    } else if (!filled(branch.address.street?.ky)) {
      problems.push(`Нет адреса на кыргызском (${where}, address.street.ky в ${CONFIG}).`);
    }
    if (branch.twoGisUrl && !/^https:\/\/(go\.)?2gis\.(kg|ru|com)\//.test(branch.twoGisUrl)) {
      problems.push(`Ссылка 2ГИС должна начинаться с https://2gis.kg/ (${where}, twoGisUrl).`);
    }
    if (branch.coordinates) {
      const { lat, lng } = branch.coordinates;
      if (!(Math.abs(lat) <= 90 && Math.abs(lng) <= 180)) problems.push(`Неверные координаты (${where}, coordinates).`);
    }
    if (!Object.values(branch.workingHours).some((day) => day.hours)) {
      problems.push(`Не указаны часы работы — все дни выходные (workingHours в ${CONFIG}).`);
    }
  }

  if (services.length === 0) problems.push(`Нет ни одной услуги (${SERVICES}).`);
  for (const service of services) {
    if (service.priceFrom === null && !service.priceAfterConsultation) {
      problems.push(
        `Услуга «${service.name.ru}»: нет цены и не отмечено «Цена после консультации» (priceFrom или priceAfterConsultation в ${SERVICES}).`,
      );
    }
  }

  if (doctors.length === 0) problems.push(`Нет ни одного врача (${DOCTORS}).`);
  const serviceIds = new Set(services.map((s) => s.id));
  for (const doctor of doctors) {
    for (const id of doctor.serviceIds) {
      if (!serviceIds.has(id)) problems.push(`Врач «${doctor.name.ru}»: услуги «${id}» нет в ${SERVICES}.`);
    }
  }
  for (const service of services) {
    if (doctors.length > 0 && !doctors.some((d) => d.serviceIds.includes(service.id))) {
      problems.push(`Услугу «${service.name.ru}» не оказывает ни один врач (serviceIds в ${DOCTORS}).`);
    }
  }

  return { problems, warnings };
}

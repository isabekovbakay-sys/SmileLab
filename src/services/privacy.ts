import { clinicConfig } from '../config/clinic';
import type { PrivacyParams } from '../i18n/ru';
import { formatInternationalPhone } from '../utils/phone';
import { hasEmail, hasPhone } from './contactLinks';

type Legal = { name: string | null; inn: string | null; address: string | null };

/** Юрлицо заполнено полностью: название, ИНН и адрес. */
export function legalOperator(legal: Legal): PrivacyParams['operator'] {
  const name = legal.name?.trim();
  const inn = legal.inn?.trim();
  const address = legal.address?.trim();
  return name && inn && address ? { name, inn, address } : null;
}

/** Параметры политики из config/clinic.ts — одни и те же для экрана и docs/privacy-policy.html. */
export function privacyParams(config = clinicConfig): PrivacyParams {
  return {
    clinic: config.name,
    phone: hasPhone(config.contacts.phone) ? formatInternationalPhone(config.contacts.phone) : null,
    email: hasEmail(config.contacts.email) ? config.contacts.email.trim() : null,
    operator: legalOperator(config.legal),
  };
}

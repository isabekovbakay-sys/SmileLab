import { clinicConfig, type PaymentMethodId } from '../../config/clinic';

/**
 * Оплата. Сейчас — только в клинике после приёма (наличные, карта, QR через приложение банка).
 * Интерфейс оставлен под будущие онлайн-провайдеры: ELQR, банки, карты.
 * Онлайн-оплату не имитируем.
 */
export interface PaymentRequest {
  appointmentId: string;
  amount: number;
  currency: 'KGS';
}

export interface PaymentSession {
  id: string;
  /** Ссылка или QR-строка провайдера. */
  payload: string;
}

export interface PaymentProvider {
  id: string;
  kind: 'in-clinic' | 'online';
  methods: PaymentMethodId[];
  /** Есть только у онлайн-провайдеров. */
  createPayment?: (request: PaymentRequest) => Promise<PaymentSession>;
}

export const inClinicPayment: PaymentProvider = {
  id: 'in-clinic',
  kind: 'in-clinic',
  methods: clinicConfig.paymentMethods,
};

export function getPaymentProvider(): PaymentProvider {
  return inClinicPayment;
}

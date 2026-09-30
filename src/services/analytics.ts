/**
 * События продукта без SDK. Провайдер (например, собственный сервер клиники)
 * подключается позже через setAnalyticsProvider. По умолчанию ничего никуда не уходит.
 */
export type AnalyticsEvent =
  | 'booking_started'
  | 'booking_step_viewed'
  | 'booking_submitted'
  | 'booking_failed'
  | 'appointment_cancelled'
  | 'appointment_rescheduled'
  | 'contact_opened'
  | 'language_changed';

export type AnalyticsProps = Record<string, string | number | boolean | null>;

export interface AnalyticsProvider {
  track(event: AnalyticsEvent, props: AnalyticsProps): void;
}

let provider: AnalyticsProvider | null = null;

export function setAnalyticsProvider(next: AnalyticsProvider | null): void {
  provider = next;
}

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}): void {
  try {
    provider?.track(event, props);
  } catch {
    // Аналитика не должна ломать сценарий пациента.
  }
}

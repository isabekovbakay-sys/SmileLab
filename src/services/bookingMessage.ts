import type { Strings } from '../i18n/ru';
import type { ClockTime, LocalDate } from '../types/domain';
import { formatDateNumeric } from '../utils/datetime';
import { formatInternationalPhone } from '../utils/phone';

export type BookingMessageKind = 'new' | 'reschedule' | 'cancel';

export interface BookingMessageInput {
  kind: BookingMessageKind;
  serviceName: string;
  /** Имя врача или «Любой свободный врач». */
  doctorLabel: string;
  date: LocalDate;
  time: ClockTime;
  /** Для переноса: прежние дата и время. */
  previous?: { date: LocalDate; time: ClockTime };
  patientName: string;
  /** E.164 */
  patientPhone: string;
  comment?: string;
}

/** Готовый текст заявки для мессенджера клиники. Дата — ДД.ММ.ГГГГ, время — 24 ч. */
export function buildBookingMessage(t: Strings, input: BookingMessageInput): string {
  const m = t.messages;
  const title = input.kind === 'new' ? m.newTitle : input.kind === 'reschedule' ? m.rescheduleTitle : m.cancelTitle;
  const lines: string[] = [title, '', `${m.service}: ${input.serviceName}`];

  if (input.kind !== 'cancel') lines.push(`${m.doctor}: ${input.doctorLabel}`);

  if (input.kind === 'reschedule' && input.previous) {
    lines.push(`${m.previous}: ${formatDateNumeric(input.previous.date)}, ${input.previous.time}`);
    lines.push(`${m.next}: ${formatDateNumeric(input.date)}, ${input.time}`);
  } else {
    lines.push(`${m.date}: ${formatDateNumeric(input.date)}`);
    lines.push(`${m.time}: ${input.time}`);
  }

  lines.push(`${m.name}: ${input.patientName.trim()}`);
  lines.push(`${m.phone}: ${formatInternationalPhone(input.patientPhone)}`);

  const comment = input.comment?.trim();
  if (comment && input.kind === 'new') lines.push(`${m.comment}: ${comment}`);

  lines.push('', m.footer);
  return lines.join('\n');
}

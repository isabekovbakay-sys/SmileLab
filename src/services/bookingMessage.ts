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
  /** Врач выбран «по возможности» (режим «желаемое время» без сервера). */
  doctorPreferred?: boolean;
  /** Режим «желаемое время»: клиника подтвердит или предложит другое. */
  wanted?: boolean;
  date: LocalDate;
  time: ClockTime;
  /** Для переноса: прежние дата и время. */
  previous?: { date: LocalDate; time: ClockTime };
  patientName: string;
  /** E.164. Нет — строка с телефоном не выводится. */
  patientPhone?: string;
  comment?: string;
}

const when = (date: LocalDate, time: ClockTime) => `${formatDateNumeric(date)}, ${time}`;

/** Готовый текст заявки для мессенджера клиники. Дата — ДД.ММ.ГГГГ, время — 24 ч. */
export function buildBookingMessage(t: Strings, input: BookingMessageInput): string {
  const m = t.messages;
  const title = input.kind === 'new' ? m.newTitle : input.kind === 'reschedule' ? m.rescheduleTitle : m.cancelTitle;
  const lines: string[] = [title, '', `${m.service}: ${input.serviceName}`];

  if (input.kind !== 'cancel') {
    lines.push(`${input.doctorPreferred ? m.doctorPreferred : m.doctor}: ${input.doctorLabel}`);
  }

  if (input.kind === 'reschedule' && input.previous) {
    lines.push(`${m.previous}: ${when(input.previous.date, input.previous.time)}`);
    lines.push(`${input.wanted ? m.newWantedTime : m.next}: ${when(input.date, input.time)}`);
  } else if (input.wanted) {
    lines.push(`${m.wantedTime}: ${when(input.date, input.time)}`);
  } else {
    lines.push(`${m.date}: ${formatDateNumeric(input.date)}`);
    lines.push(`${m.time}: ${input.time}`);
  }

  lines.push(`${m.name}: ${input.patientName.trim()}`);
  if (input.patientPhone) lines.push(`${m.phone}: ${formatInternationalPhone(input.patientPhone)}`);

  const comment = input.comment?.trim();
  if (comment && input.kind === 'new') lines.push(`${m.comment}: ${comment}`);

  lines.push('', m.footer);
  return lines.join('\n');
}

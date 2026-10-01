import type {
  Appointment,
  AppointmentRequest,
  ClinicContent,
  ClockTime,
  DayAvailability,
  Doctor,
  LocalDate,
  Service,
} from '../types/domain';

export interface AvailabilityQuery {
  serviceId: string;
  /** null — любой врач, который оказывает услугу. */
  doctorId: string | null;
  branchId: string;
  fromDate: LocalDate;
  days: number;
  /** При переносе собственная запись не должна блокировать время. */
  excludeAppointmentId?: string;
}

export interface RescheduleInput {
  date: LocalDate;
  time: ClockTime;
  doctorId: string;
  anyDoctor?: boolean;
}

export interface ClinicRepository {
  listServices(): Promise<Service[]>;
  getService(id: string): Promise<Service | null>;
  listDoctors(): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | null>;
  getContent(): Promise<ClinicContent>;
}

export interface ScheduleRepository {
  getAvailability(query: AvailabilityQuery): Promise<DayAvailability[]>;
}

export interface AppointmentRepository {
  list(): Promise<Appointment[]>;
  create(request: AppointmentRequest): Promise<Appointment>;
  cancel(id: string): Promise<Appointment>;
  reschedule(id: string, input: RescheduleInput): Promise<Appointment>;
  /** Удалить записи, сохранённые на телефоне. */
  clearLocal(): Promise<void>;
}

export interface Repositories {
  clinic: ClinicRepository;
  schedule: ScheduleRepository;
  appointments: AppointmentRepository;
}

/** Время уже занято: UI показывает сообщение и возвращает на выбор времени. */
export class SlotUnavailableError extends Error {
  constructor(message = 'slot-unavailable') {
    super(message);
    this.name = 'SlotUnavailableError';
  }
}

export class NotFoundError extends Error {
  constructor(message = 'not-found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

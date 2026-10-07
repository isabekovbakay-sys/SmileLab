export type Language = 'ky' | 'ru';

/** Текст на обоих языках приложения. Выбирается через `l(text)` из `useI18n()`. */
export type LocalizedText = Record<Language, string>;

export type CityId = 'bishkek' | 'osh' | 'karakol' | 'jalal-abad' | 'tokmok' | 'naryn' | 'talas' | 'batken';

export interface Address {
  cityId: CityId;
  district: LocalizedText | null;
  street: LocalizedText | null;
  building: string | null;
  /** Ориентир: «напротив ЦУМа». */
  landmark: LocalizedText | null;
}

export type Weekday = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

/** "HH:mm", 24 часа, время клиники (UTC+6). */
export type ClockTime = string;

/** "YYYY-MM-DD", дата по времени клиники. */
export type LocalDate = string;

export interface TimeRange {
  start: ClockTime;
  end: ClockTime;
}

export interface DaySchedule {
  /** null — выходной. */
  hours: TimeRange | null;
  breaks: TimeRange[];
}

export type WeeklySchedule = Record<Weekday, DaySchedule>;

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Branch {
  id: string;
  name: LocalizedText;
  address: Address;
  /** Точные координаты входа. null — карта ищет по полному адресу. */
  coordinates: Coordinates | null;
  /** Прямая ссылка на карточку клиники в 2ГИС (https://2gis.kg/bishkek/firm/…). */
  twoGisUrl: string | null;
  workingHours: WeeklySchedule;
}

export type ServiceGlyph =
  | 'consultation'
  | 'hygiene'
  | 'caries'
  | 'endo'
  | 'extraction'
  | 'implant'
  | 'prosthetics'
  | 'orthodontics';

export interface ProcessStep {
  title: LocalizedText;
  text: LocalizedText;
}

export interface FaqItem {
  id: string;
  question: LocalizedText;
  answer: LocalizedText;
}

export interface Service {
  id: string;
  glyph: ServiceGlyph;
  name: LocalizedText;
  summary: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  process: ProcessStep[];
  expectations: LocalizedText[];
  faq: FaqItem[];
  /** Цена «от», в сомах. null — цену не показываем (см. priceAfterConsultation). */
  priceFrom: number | null;
  /** Цену называет врач после осмотра: вместо цены — «Цена после консультации». */
  priceAfterConsultation: boolean;
  durationMin: number;
  featured: boolean;
  isConsultation: boolean;
}

export interface Doctor {
  id: string;
  name: LocalizedText;
  role: LocalizedText;
  focus: LocalizedText;
  serviceIds: string[];
  branchIds: string[];
  languages: Language[];
  schedule: WeeklySchedule;
  slotMinutes: number;
}

export interface TimeSlot {
  time: ClockTime;
  doctorIds: string[];
}

export interface DayAvailability {
  date: LocalDate;
  clinicOpen: boolean;
  slots: TimeSlot[];
}

export type ContactChannel = 'call' | 'whatsapp' | 'telegram';

export interface PatientInfo {
  name: string;
  /** E.164: +996XXXXXXXXX */
  phone: string;
}

export interface AppointmentRequest {
  serviceId: string;
  /** Врач, за которым закреплено время. При anyDoctor — выбран приложением, пациенту не показывается. */
  doctorId: string;
  anyDoctor?: boolean;
  branchId: string;
  date: LocalDate;
  time: ClockTime;
  patient: PatientInfo;
  comment: string;
  contactChannel: ContactChannel;
}

export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled';

/**
 * Запись, сохранённая на телефоне. Телефон пациента и комментарий не храним:
 * они уходят только в сообщение клинике (или на сервер).
 */
export interface Appointment extends Omit<AppointmentRequest, 'patient' | 'comment'> {
  patient: { name: string };
  id: string;
  status: AppointmentStatus;
  /** ISO 8601 со смещением клиники: 2026-09-30T15:00:00+06:00 */
  startsAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicPrinciple {
  id: string;
  title: LocalizedText;
  text: LocalizedText;
}

/** Тексты клиники, которые могут приходить с сервера. */
export interface ClinicContent {
  /** Заголовок героя, строки разделены "\n". */
  heroTitle: LocalizedText;
  heroSubtitle: LocalizedText;
  principles: ClinicPrinciple[];
  /** Промо-карточка имплантации на главной. null — карточки нет. */
  implantPromo: {
    serviceId: string;
    title: LocalizedText;
    text: LocalizedText;
    /** Композиция на герое имплантации: первое слово за имплантом, второе перед ним. */
    artWords: Record<Language, [string, string]>;
  } | null;
  medicalDisclaimer: LocalizedText;
}

export interface PatientProfile {
  name: string;
  /** E.164 или пустая строка. */
  phone: string;
  email: string;
}

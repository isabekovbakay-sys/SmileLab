import type { ClinicContent, Doctor, Service } from '../types/domain';
import { clinicContent } from './clinic/content';
import { clinicDoctors } from './clinic/doctors';
import { clinicServices } from './clinic/services';
import { demo } from './demoGate';

export interface Catalog {
  services: Service[];
  doctors: Doctor[];
  content: ClinicContent;
}

/**
 * Каталог клиники для режима без сервера: в демо-сборке (EXPO_PUBLIC_DEMO=1) — демо-данные,
 * в релизной — реальные из src/data/clinic.
 */
export const catalog: Catalog = demo?.demoCatalog ?? {
  services: clinicServices,
  doctors: clinicDoctors,
  content: clinicContent,
};

import type { Catalog } from '../catalog';
import { demoContent } from './content';
import { demoDoctors } from './doctors';
import { demoWorkingHours } from './schedule';
import { demoServices } from './services';
import { demoStrings } from './strings';

/** Всё демо одним модулем: подключается только в демо-сборке (см. src/data/demoGate.ts). */
export const demoCatalog: Catalog = {
  services: demoServices,
  doctors: demoDoctors,
  content: demoContent,
};

export { demoStrings, demoWorkingHours };
export type { DemoStrings } from './strings';

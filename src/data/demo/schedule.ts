import { clinicConfig } from '../../config/clinic';

/** Демо-сборка показывает те же часы, что и релиз (src/config/clinic.ts). */
export const demoWorkingHours = clinicConfig.branches[0]!.workingHours;

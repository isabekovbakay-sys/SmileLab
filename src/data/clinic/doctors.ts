import type { Doctor } from '../../types/domain';

/**
 * ВРАЧИ КЛИНИКИ — заполняет владелец. Пока список пуст, блок «Врачи» скрыт,
 * при записи врач не выбирается («Любой свободный врач»), а release-check не даст собрать релиз.
 *
 * Образец (фото не нужны: в приложении показывается монограмма):
 *
 *   {
 *     id: 'aidana',                                        // латиницей, не меняется после выпуска
 *     name: { ru: 'Айдана Асанова', ky: 'Айдана Асанова' },
 *     role: { ru: 'Стоматолог-терапевт', ky: 'Стоматолог-терапевт' },
 *     focus: { ru: 'Лечение кариеса и каналов', ky: 'Кариести жана каналдарды дарылоо' },
 *     serviceIds: ['consultation', 'caries'],             // id услуг из src/data/clinic/services.ts
 *     branchIds: ['main'],                                // id филиала из src/config/clinic.ts
 *     languages: ['ky', 'ru'],                            // языки приёма
 *     schedule: {                                         // дни приёма; hours: null — не принимает
 *       mon: { hours: { start: '09:00', end: '18:00' }, breaks: [{ start: '13:00', end: '14:00' }] },
 *       tue: { hours: null, breaks: [] },
 *       …все 7 дней: mon tue wed thu fri sat sun
 *     },
 *     slotMinutes: 30,
 *   },
 */
export const clinicDoctors: Doctor[] = [];

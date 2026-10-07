import type { Service } from '../../types/domain';

/**
 * УСЛУГИ КЛИНИКИ — заполняет владелец. Пока список пуст, в приложении вместо услуг
 * показывается «Позвоните — расскажем о ценах», а release-check не даст собрать релиз.
 *
 * Образец одной услуги (все тексты — на русском и кыргызском):
 *
 *   {
 *     id: 'consultation',                // латиницей, без пробелов, не меняется после выпуска
 *     glyph: 'consultation',             // иконка: consultation | hygiene | caries | endo |
 *                                        //         extraction | implant | prosthetics | orthodontics
 *     name: { ru: 'Консультация', ky: 'Консультация' },
 *     summary: { ru: 'Одна строка для списка', ky: '…' },
 *     description: { ru: 'Абзац «О процедуре»', ky: '…' },
 *     highlights: [{ ru: 'Что входит — пункт', ky: '…' }],
 *     process: [{ title: { ru: 'Этап', ky: '…' }, text: { ru: 'Что происходит', ky: '…' } }],
 *     expectations: [{ ru: 'Чего ожидать — пункт', ky: '…' }],
 *     faq: [{ id: 'q1', question: { ru: '…', ky: '…' }, answer: { ru: '…', ky: '…' } }],
 *     priceFrom: 500,                    // цена «от» в сомах; null — если цену называют после осмотра
 *     priceAfterConsultation: false,     // true — показывать «Цена после консультации» (вместе с priceFrom: null)
 *     durationMin: 30,                   // длительность приёма в минутах
 *     featured: true,                    // показывать на главной
 *     isConsultation: true,              // ровно одна услуга — консультация (её предлагают первой)
 *   },
 *
 * Готовые описания типовых услуг на двух языках можно взять из src/data/demo/services.ts
 * и поправить под клинику (цены там — примеры).
 */
export const clinicServices: Service[] = [];

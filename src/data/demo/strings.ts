import type { Language } from '../../types/domain';

/**
 * Тексты, которые нужны только демо-сборке. Лежат отдельно от словарей интерфейса,
 * чтобы в релизный бандл не попала ни одна демо-строка.
 */
export interface DemoStrings {
  badge: string;
  notice: string;
  successTitle: string;
  successText: (channel: string) => string;
  sendManually: (channel: string) => string;
}

export const demoStrings: Record<Language, DemoStrings> = {
  ru: {
    badge: 'Демо',
    notice: 'Демо-режим: цены, врачи и расписание — примеры. Заявки не уходят в клинику автоматически.',
    successTitle: 'Заявка сохранена',
    successText: (channel) =>
      `Демо-режим: заявка сохранена только на телефоне. Чтобы клиника её получила, отправьте её в ${channel}.`,
    sendManually: (channel) => `Отправить в ${channel}`,
  },
  ky: {
    badge: 'Демо',
    notice:
      'Демо режими: баалар, дарыгерлер жана график — мисал катары гана. Арыздар клиникага автоматтык түрдө жөнөтүлбөйт.',
    successTitle: 'Арыз сакталды',
    successText: (channel) =>
      `Демо режими: арыз телефонуңузда гана сакталды. Клиника алышы үчүн аны ${channel} аркылуу жөнөтүңүз.`,
    sendManually: (channel) => `${channel} аркылуу жөнөтүү`,
  },
};

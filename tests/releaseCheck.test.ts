import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { releaseProblems } from '../scripts/releaseRules';
import { clinicConfig, type ClinicConfig } from '../src/config/clinic';
import { clinicDoctors } from '../src/data/clinic/doctors';
import { clinicServices } from '../src/data/clinic/services';
import { demoDoctors } from '../src/data/demo/doctors';
import { demoWorkingHours } from '../src/data/demo/schedule';
import { demoServices } from '../src/data/demo/services';

const branch = clinicConfig.branches[0]!;

/** Заполненный конфиг — только для теста. Реальные данные вписывает владелец. */
const filled: ClinicConfig = {
  ...clinicConfig,
  legal: { name: 'ОсОО «Тест»', inn: '01234567890123', address: 'г. Бишкек, ул. Тестовая, 1' },
  branches: [
    {
      ...branch,
      address: { ...branch.address, street: { ru: 'ул. Тестовая', ky: 'Тестовая көчөсү' }, building: '1' },
      workingHours: demoWorkingHours,
    },
  ],
};

describe('release-check', () => {
  it('на текущих (пустых) данных падает с понятными ошибками', () => {
    const problems = releaseProblems({ config: clinicConfig, services: clinicServices, doctors: clinicDoctors });
    const text = problems.join('\n');
    assert.ok(problems.length > 0);
    for (const expected of ['юрлицо', 'ИНН', 'юридический адрес', 'улица и дом', 'часы работы', 'услуги', 'врача']) {
      assert.ok(text.includes(expected), `нет ошибки про «${expected}»`);
    }
    // Телефон и e-mail заданы — про них ошибок нет.
    assert.ok(!text.includes('телефон клиники'));
    assert.ok(!text.includes('e-mail'));
  });

  it('на заполненных данных проходит', () => {
    assert.deepEqual(releaseProblems({ config: filled, services: demoServices, doctors: demoDoctors }), []);
  });

  it('пустые телефон и e-mail, ИНН не из 14 цифр', () => {
    const config: ClinicConfig = {
      ...filled,
      legal: { ...filled.legal, inn: '123' },
      contacts: { ...filled.contacts, phone: '', whatsapp: '', email: '' },
    };
    const text = releaseProblems({ config, services: demoServices, doctors: demoDoctors }).join('\n');
    assert.ok(text.includes('Не указан телефон клиники'));
    assert.ok(text.includes('Не указан e-mail'));
    assert.ok(text.includes('номер WhatsApp'));
    assert.ok(text.includes('14 цифр'));
  });

  it('услуга без цены и без «после консультации» — ошибка', () => {
    const services = demoServices.map((s, i) =>
      i === 0 ? { ...s, priceFrom: null, priceAfterConsultation: false } : s,
    );
    const problems = releaseProblems({ config: filled, services, doctors: demoDoctors });
    assert.equal(problems.length, 1);
    assert.match(problems[0]!, /нет цены/);
  });

  it('заявки в Telegram требуют username', () => {
    const config: ClinicConfig = { ...filled, booking: { ...filled.booking, requestChannel: 'telegram' } };
    const problems = releaseProblems({ config, services: demoServices, doctors: demoDoctors });
    assert.equal(problems.length, 1);
    assert.match(problems[0]!, /username/);
  });
});

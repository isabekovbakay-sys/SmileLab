import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { wipeLocalData } from '../src/services/dataWipe';
import { hasLegacyPersonalFields, sanitizeAppointments, toStoredAppointment } from '../src/services/mock/sanitize';
import type { Appointment } from '../src/types/domain';

const legacy = {
  id: 'a1',
  serviceId: 'caries',
  doctorId: 'aigerim',
  anyDoctor: false,
  branchId: 'main',
  date: '2026-10-05',
  time: '10:00',
  patient: { name: 'Бакай', phone: '+996555123456' },
  comment: 'Болит зуб',
  contactChannel: 'whatsapp',
  status: 'requested',
  startsAt: '2026-10-05T10:00:00+06:00',
  createdAt: '',
  updatedAt: '',
};

describe('записи на телефоне', () => {
  it('старые записи: телефон и комментарий удаляются, остальное сохраняется', () => {
    assert.ok(hasLegacyPersonalFields([legacy]));
    const [clean] = sanitizeAppointments([legacy]);
    assert.ok(clean);
    assert.deepEqual(clean.patient, { name: 'Бакай' });
    assert.ok(!('comment' in clean));
    assert.equal(clean.date, '2026-10-05');
    assert.equal(clean.serviceId, 'caries');
    assert.ok(!hasLegacyPersonalFields([clean]));
    assert.ok(!JSON.stringify(clean).includes('+996555123456'));
  });

  it('повреждённые записи отбрасываются', () => {
    const broken = [
      null,
      1,
      { ...legacy, date: '2026-13-40' },
      { ...legacy, patient: null },
      { ...legacy, status: 'x' },
    ];
    assert.deepEqual(sanitizeAppointments(broken), []);
    assert.deepEqual(sanitizeAppointments('not array'), []);
  });

  it('новая запись сохраняется без телефона и комментария', () => {
    const stored = toStoredAppointment(legacy as unknown as Appointment);
    assert.deepEqual(Object.keys(stored.patient), ['name']);
    assert.ok(!('comment' in stored));
  });
});

describe('«Удалить мои данные»', () => {
  it('чистит SecureStore, все ключи приложения в AsyncStorage и кэши', async () => {
    const secure = new Map([['smilelab.profile.v1', '{"name":"Бакай"}']]);
    const storage = new Map([
      ['smilelab:appointments.v1', '[]'],
      ['smilelab:settings.v1', '{}'],
      ['smilelab:profile.v1', '{}'],
      ['other-app:key', 'keep'],
    ]);
    let cachesCleared = false;
    await wipeLocalData(
      {
        deleteSecure: async (keys) => keys.forEach((k) => secure.delete(k)),
        listAppKeys: async () => [...storage.keys()].filter((k) => k.startsWith('smilelab:')),
        removeRawKeys: async (keys) => keys.forEach((k) => storage.delete(k)),
        clearCaches: () => {
          cachesCleared = true;
        },
      },
      ['smilelab.profile.v1'],
    );
    assert.equal(secure.size, 0);
    assert.deepEqual([...storage.keys()], ['other-app:key']);
    assert.ok(cachesCleared);
  });
});

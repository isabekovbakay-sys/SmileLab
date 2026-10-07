import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clinicConfig } from '../src/config/clinic';
import { catalog, type Catalog } from '../src/data/catalog';
import { clinicContent } from '../src/data/clinic/content';
import { clinicDoctors } from '../src/data/clinic/doctors';
import { clinicServices } from '../src/data/clinic/services';
import { demoCatalog } from '../src/data/demo';
import type { LocalizedText } from '../src/types/domain';

function assertLocalized(text: LocalizedText, where: string) {
  assert.ok(text.ru.trim(), `${where}: нет RU`);
  assert.ok(text.ky.trim(), `${where}: нет KY`);
}

/** Общие правила для любого каталога — и демо, и реального, когда владелец его заполнит. */
function validateCatalog({ services, doctors, content }: Catalog) {
  for (const s of services) {
    for (const field of [s.name, s.summary, s.description]) assertLocalized(field, s.id);
    s.highlights.forEach((h, i) => assertLocalized(h, `${s.id}.highlights[${i}]`));
    s.expectations.forEach((h, i) => assertLocalized(h, `${s.id}.expectations[${i}]`));
    s.process.forEach((p, i) => {
      assertLocalized(p.title, `${s.id}.process[${i}].title`);
      assertLocalized(p.text, `${s.id}.process[${i}].text`);
    });
    s.faq.forEach((f) => {
      assertLocalized(f.question, `${s.id}.faq.${f.id}`);
      assertLocalized(f.answer, `${s.id}.faq.${f.id}`);
    });
    assert.ok(s.durationMin > 0);
    assert.ok(s.priceFrom === null || s.priceFrom > 0);
    // Цена или пометка «после консультации» — что-то одно.
    assert.ok(!(s.priceFrom !== null && s.priceAfterConsultation), `${s.id}: и цена, и «после консультации»`);
  }
  assert.ok(services.filter((s) => s.isConsultation).length <= 1, 'консультация — не больше одной');

  const serviceIds = new Set(services.map((s) => s.id));
  const branchIds = new Set(clinicConfig.branches.map((b) => b.id));
  for (const d of doctors) {
    for (const field of [d.name, d.role, d.focus]) assertLocalized(field, d.id);
    assert.ok(d.serviceIds.length > 0, d.id);
    for (const id of d.serviceIds) assert.ok(serviceIds.has(id), `${d.id} → ${id}`);
    for (const id of d.branchIds) assert.ok(branchIds.has(id), `${d.id} → ${id}`);
    assert.ok(d.languages.length > 0);
  }
  if (doctors.length > 0) {
    for (const s of services)
      assert.ok(
        doctors.some((d) => d.serviceIds.includes(s.id)),
        `${s.id}: нет врача`,
      );
  }

  assertLocalized(content.heroTitle, 'heroTitle');
  assertLocalized(content.heroSubtitle, 'heroSubtitle');
  assertLocalized(content.medicalDisclaimer, 'medicalDisclaimer');
  content.principles.forEach((p) => {
    assertLocalized(p.title, p.id);
    assertLocalized(p.text, p.id);
    assert.ok(!/\d+\s*%|лет опыта|жылдык тажрыйба/.test(p.text.ru + p.text.ky));
  });
  if (content.implantPromo) assert.ok(serviceIds.has(content.implantPromo.serviceId), 'промо без услуги');
}

describe('данные клиники', () => {
  it('демо-каталог корректен', () => {
    validateCatalog(demoCatalog);
    assert.equal(demoCatalog.services.filter((s) => s.isConsultation).length, 1);
    // В демо есть пример услуги «Цена после консультации».
    assert.ok(demoCatalog.services.some((s) => s.priceFrom === null && s.priceAfterConsultation));
  });

  it('реальный каталог корректен (пока пустой — ничего не выдумано)', () => {
    validateCatalog({ services: clinicServices, doctors: clinicDoctors, content: clinicContent });
  });

  it('без EXPO_PUBLIC_DEMO=1 приложение берёт реальный каталог, а не демо', () => {
    assert.notEqual(process.env.EXPO_PUBLIC_DEMO, '1');
    assert.equal(catalog.services, clinicServices);
    assert.equal(catalog.doctors, clinicDoctors);
    assert.equal(clinicConfig.isDemo, false);
  });

  it('у роли врача одинаковая должность на обоих языках', () => {
    const roles = new Map<string, string>();
    for (const d of demoCatalog.doctors) {
      const known = roles.get(d.role.ru);
      if (known) assert.equal(d.role.ky, known, d.id);
      roles.set(d.role.ru, d.role.ky);
    }
  });

  it('контакты клиники в конфиге не тронуты, неизвестное — пусто', () => {
    assert.equal(clinicConfig.contacts.phone, '+996507597099');
    assert.equal(clinicConfig.contacts.whatsapp, '+996507597099');
    assert.equal(clinicConfig.contacts.telegram.phone, '+996507597099');
    assert.equal(clinicConfig.contacts.email, 'isabekovbakay@gmail.com');
    const branch = clinicConfig.branches[0]!;
    assert.equal(branch.coordinates, null);
    assert.equal(branch.twoGisUrl, null);
    assert.equal(branch.address.street, null);
    assert.deepEqual(clinicConfig.legal, { name: null, inn: null, address: null });
  });
});

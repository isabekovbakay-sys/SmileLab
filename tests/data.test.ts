import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { clinicConfig } from '../src/config/clinic';
import { mockClinicContent } from '../src/data/mock/clinicContent';
import { mockDoctors } from '../src/data/mock/doctors';
import { mockServices } from '../src/data/mock/services';
import type { LocalizedText } from '../src/types/domain';

function assertLocalized(text: LocalizedText, where: string) {
  assert.ok(text.ru.trim(), `${where}: нет RU`);
  assert.ok(text.ky.trim(), `${where}: нет KY`);
}

describe('данные клиники', () => {
  it('у каждой услуги оба языка во всех полях', () => {
    for (const s of mockServices) {
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
    }
  });

  it('консультация есть и она одна', () => {
    assert.equal(mockServices.filter((s) => s.isConsultation).length, 1);
  });

  it('у каждого врача оба языка; связи врач → услуга и филиал корректны', () => {
    const serviceIds = new Set(mockServices.map((s) => s.id));
    const branchIds = new Set(clinicConfig.branches.map((b) => b.id));
    for (const d of mockDoctors) {
      for (const field of [d.name, d.role, d.focus]) assertLocalized(field, d.id);
      assert.ok(d.serviceIds.length > 0, d.id);
      for (const id of d.serviceIds) assert.ok(serviceIds.has(id), `${d.id} → ${id}`);
      for (const id of d.branchIds) assert.ok(branchIds.has(id), `${d.id} → ${id}`);
      assert.ok(d.languages.length > 0);
    }
  });

  it('каждую услугу оказывает хотя бы один врач', () => {
    for (const s of mockServices) {
      assert.ok(mockDoctors.some((d) => d.serviceIds.includes(s.id)), s.id);
    }
  });

  it('тексты клиники на обоих языках, без выдуманных цифр', () => {
    assertLocalized(mockClinicContent.heroTitle, 'heroTitle');
    assertLocalized(mockClinicContent.heroSubtitle, 'heroSubtitle');
    mockClinicContent.principles.forEach((p) => {
      assertLocalized(p.title, p.id);
      assertLocalized(p.text, p.id);
      assert.ok(!/\d+\s*%|лет опыта|жылдык тажрыйба/.test(p.text.ru + p.text.ky));
    });
    assert.ok(mockServices.some((s) => s.id === mockClinicContent.implantPromo.serviceId));
  });

  it('контакты клиники в конфиге', () => {
    assert.equal(clinicConfig.contacts.whatsapp, '+996507597099');
    assert.equal(clinicConfig.contacts.telegram.phone, '+996507597099');
    assert.equal(clinicConfig.contacts.email, 'isabekovbakay@gmail.com');
    assert.equal(clinicConfig.branches[0]?.coordinates, null);
  });
});

import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  formatInternationalPhone,
  formatNationalPhone,
  normalizeKgPhone,
  phoneDigits,
  toE164,
  validateKgPhone,
} from '../src/utils/phone';

describe('normalizeKgPhone: любая вставка → 9 национальных цифр', () => {
  const cases: [string, string][] = [
    ['+996 555 12-34-56', '555123456'],
    ['+996555123456', '555123456'],
    ['996555123456', '555123456'],
    ['0555123456', '555123456'],
    ['0555 12-34-56', '555123456'],
    ['00996555123456', '555123456'],
    ['555 123 456', '555123456'],
    ['(555) 12 34 56', '555123456'],
    ['+996 555 123 456 789', '555123456'],
    ['5551234567890', '555123456'],
    ['  +996-700-00-11-22 ', '700001122'],
    ['', ''],
    ['55', '55'],
  ];
  for (const [input, expected] of cases) {
    it(`«${input}» → «${expected}»`, () => assert.equal(normalizeKgPhone(input), expected));
  }

  it('национальный номер, начинающийся с 996, не обрезается', () => {
    assert.equal(normalizeKgPhone('996123456'), '996123456');
  });
});

describe('validateKgPhone', () => {
  it('статусы', () => {
    assert.equal(validateKgPhone(''), 'empty');
    assert.equal(validateKgPhone('55512'), 'incomplete');
    assert.equal(validateKgPhone('055512345'), 'invalidPrefix');
    assert.equal(validateKgPhone('155512345'), 'invalidPrefix');
    assert.equal(validateKgPhone('555123456'), 'ok');
    assert.equal(validateKgPhone('700001122'), 'ok');
  });
});

describe('форматирование', () => {
  it('маска XXX XXX XXX, в том числе частичная', () => {
    assert.equal(formatNationalPhone('555123456'), '555 123 456');
    assert.equal(formatNationalPhone('5551'), '555 1');
    assert.equal(formatNationalPhone(''), '');
  });
  it('E.164 и отображение', () => {
    assert.equal(toE164('555123456'), '+996555123456');
    assert.equal(formatInternationalPhone('+996555123456'), '+996 555 123 456');
    assert.equal(phoneDigits('+996 507 597 099'), '996507597099');
  });
});

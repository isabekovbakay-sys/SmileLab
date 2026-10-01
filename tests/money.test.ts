import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { ky } from '../src/i18n/ky';
import { ru } from '../src/i18n/ru';
import { formatAmount, formatMoney, NBSP } from '../src/utils/money';

describe('деньги — только сомы', () => {
  it('formatMoney с неразрывными пробелами', () => {
    assert.equal(formatMoney(38000), `38${NBSP}000${NBSP}сом`);
    assert.equal(formatMoney(500), `500${NBSP}сом`);
    assert.equal(formatMoney(1250000), `1${NBSP}250${NBSP}000${NBSP}сом`);
    assert.equal(formatAmount(0), '0');
  });

  it('priceFrom на русском и кыргызском', () => {
    assert.equal(ru.common.priceFrom(2500), `от 2${NBSP}500${NBSP}сом`);
    assert.equal(ky.common.priceFrom(2500), `2${NBSP}500${NBSP}сомдон`);
  });

  it('нет долларов и евро в словарях', () => {
    const text = JSON.stringify([ru, ky]);
    assert.ok(!/[$€]|USD|EUR/.test(text));
  });
});

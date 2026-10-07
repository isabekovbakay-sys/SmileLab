import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBranch } from '../src/config/clinic';
import {
  fullAddress,
  hasEmail,
  hasPhone,
  hasTelegram,
  mailtoUrl,
  mapLink,
  telegramUrl,
  telUrl,
  twoGisLink,
  whatsappUrl,
} from '../src/services/contactLinks';
import type { Branch, LocalizedText } from '../src/types/domain';

const ru = (text: LocalizedText) => text.ru;
const empty = getBranch();
const withAddress: Branch = {
  ...empty,
  address: { ...empty.address, street: { ru: 'ул. Токтогула', ky: 'Токтогул көчөсү' }, building: '100' },
};
const withCoordinates: Branch = { ...withAddress, coordinates: { lat: 42.87, lng: 74.59 } };

describe('ссылки для связи', () => {
  it('tel: и wa.me с текстом', () => {
    assert.equal(telUrl('+996 507 597 099'), 'tel:+996507597099');
    assert.equal(whatsappUrl('+996507597099'), 'https://wa.me/996507597099');
    assert.equal(
      whatsappUrl('+996507597099', 'Привет & да'),
      'https://wa.me/996507597099?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%26%20%D0%B4%D0%B0',
    );
  });

  it('Telegram: по @username с текстом, по номеру — без текста, без контактов — скрыт', () => {
    assert.equal(
      telegramUrl({ username: '@smilelab', phone: null }, 'Салам'),
      'https://t.me/smilelab?text=%D0%A1%D0%B0%D0%BB%D0%B0%D0%BC',
    );
    assert.equal(telegramUrl({ username: null, phone: '+996507597099' }, 'Салам'), 'https://t.me/+996507597099');
    assert.equal(telegramUrl({ username: '', phone: '' }), null);
    assert.equal(hasTelegram({ username: null, phone: null }), false);
    assert.equal(hasTelegram({ username: ' ', phone: '' }), false);
    assert.equal(hasTelegram({ username: null, phone: '+996507597099' }), true);
  });

  it('телефон и e-mail: пустые значения прячут кнопки', () => {
    assert.equal(hasPhone(''), false);
    assert.equal(hasPhone(null), false);
    assert.equal(hasPhone('+996507597099'), true);
    assert.equal(hasEmail(''), false);
    assert.equal(hasEmail('  '), false);
    assert.equal(hasEmail('isabekovbakay@gmail.com'), true);
  });

  it('mailto с темой', () => {
    assert.equal(
      mailtoUrl('isabekovbakay@gmail.com', 'SmileLab запись'),
      'mailto:isabekovbakay@gmail.com?subject=SmileLab%20%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D1%8C',
    );
  });
});

describe('адрес и карты', () => {
  it('полный адрес — только заполненные части', () => {
    assert.equal(fullAddress(empty.address, ru), 'Бишкек');
    assert.equal(fullAddress(withAddress.address, ru), 'Бишкек, ул. Токтогула, 100');
  });

  it('без улицы и дома: 2ГИС и карта скрыты (поиска по одному названию нет)', () => {
    assert.equal(twoGisLink(empty, ru), null);
    assert.equal(mapLink(empty, 'SmileLab', ru, 'android'), null);
    // Улица без дома — тоже не адрес.
    const noBuilding: Branch = { ...withAddress, address: { ...withAddress.address, building: null } };
    assert.equal(twoGisLink(noBuilding, ru), null);
  });

  it('2ГИС: прямая ссылка как есть, иначе поиск по полному адресу', () => {
    const url = 'https://2gis.kg/bishkek/firm/70000001234567';
    assert.equal(twoGisLink({ ...empty, twoGisUrl: url }, ru), url);
    assert.equal(
      twoGisLink(withAddress, ru),
      `https://2gis.kg/bishkek/search/${encodeURIComponent('Бишкек, ул. Токтогула, 100')}`,
    );
  });

  it('карта: координаты → geo: с подписью на Android; иначе поиск по адресу', () => {
    assert.deepEqual(mapLink(withCoordinates, 'SmileLab', ru, 'android'), {
      url: 'geo:42.87,74.59?q=42.87,74.59(SmileLab)',
      fallback: 'https://www.google.com/maps/search/?api=1&query=42.87,74.59',
    });
    assert.equal(
      mapLink(withCoordinates, 'SmileLab', ru, 'other')?.url,
      'https://www.google.com/maps/search/?api=1&query=42.87,74.59',
    );
    const query = encodeURIComponent('Бишкек, ул. Токтогула, 100');
    assert.equal(mapLink(withAddress, 'SmileLab', ru, 'android')?.url, `geo:0,0?q=${query}`);
    assert.equal(
      mapLink(withAddress, 'SmileLab', ru, 'other')?.url,
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    );
  });

  it('только координаты (без адреса) — карта есть, 2ГИС нет', () => {
    const coordsOnly: Branch = { ...empty, coordinates: { lat: 42.87, lng: 74.59 } };
    assert.ok(mapLink(coordsOnly, 'SmileLab', ru, 'android'));
    assert.equal(twoGisLink(coordsOnly, ru), null);
  });
});

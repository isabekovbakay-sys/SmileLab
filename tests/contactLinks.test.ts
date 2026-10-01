import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { getBranch } from '../src/config/clinic';
import { geoUrl, mailtoUrl, mapQuery, telegramUrl, telUrl, twoGisUrl, whatsappUrl } from '../src/services/contactLinks';

describe('ссылки для связи', () => {
  it('tel: и wa.me с текстом', () => {
    assert.equal(telUrl('+996 507 597 099'), 'tel:+996507597099');
    assert.equal(whatsappUrl('+996507597099'), 'https://wa.me/996507597099');
    assert.equal(whatsappUrl('+996507597099', 'Привет & да'), 'https://wa.me/996507597099?text=%D0%9F%D1%80%D0%B8%D0%B2%D0%B5%D1%82%20%26%20%D0%B4%D0%B0');
  });

  it('Telegram: по @username с текстом, по номеру — без текста', () => {
    assert.equal(telegramUrl({ username: 'smilelab', phone: '+996507597099' }, 'Салам'), 'https://t.me/smilelab?text=%D0%A1%D0%B0%D0%BB%D0%B0%D0%BC');
    assert.equal(telegramUrl({ username: null, phone: '+996507597099' }, 'Салам'), 'https://t.me/+996507597099');
  });

  it('mailto с темой', () => {
    assert.equal(mailtoUrl('isabekovbakay@gmail.com', 'SmileLab запись'), 'mailto:isabekovbakay@gmail.com?subject=SmileLab%20%D0%B7%D0%B0%D0%BF%D0%B8%D1%81%D1%8C');
  });

  it('2ГИС и geo: без выдуманных координат', () => {
    const address = getBranch().address;
    const query = mapQuery('SmileLab', address, (t) => t.ru);
    assert.equal(query, 'SmileLab, Бишкек');
    assert.equal(twoGisUrl(address, query), `https://2gis.kg/bishkek/search/${encodeURIComponent(query)}`);
    assert.equal(geoUrl(query, null), `geo:0,0?q=${encodeURIComponent(query)}`);
    assert.equal(geoUrl('X', { lat: 42.87, lng: 74.59 }), 'geo:42.87,74.59?q=42.87,74.59(X)');
  });
});

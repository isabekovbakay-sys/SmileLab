import type { CityId, LocalizedText } from '../types/domain';

export interface City {
  id: CityId;
  name: LocalizedText;
  /** Сегмент города в ссылках 2ГИС (2gis.kg/<slug>/search/…). null — поиск без города. */
  twoGisSlug: string | null;
}

export const cities: Record<CityId, City> = {
  bishkek: { id: 'bishkek', name: { ru: 'Бишкек', ky: 'Бишкек' }, twoGisSlug: 'bishkek' },
  osh: { id: 'osh', name: { ru: 'Ош', ky: 'Ош' }, twoGisSlug: 'osh' },
  karakol: { id: 'karakol', name: { ru: 'Каракол', ky: 'Каракол' }, twoGisSlug: null },
  'jalal-abad': { id: 'jalal-abad', name: { ru: 'Джалал-Абад', ky: 'Жалал-Абад' }, twoGisSlug: null },
  tokmok: { id: 'tokmok', name: { ru: 'Токмок', ky: 'Токмок' }, twoGisSlug: null },
  naryn: { id: 'naryn', name: { ru: 'Нарын', ky: 'Нарын' }, twoGisSlug: null },
  talas: { id: 'talas', name: { ru: 'Талас', ky: 'Талас' }, twoGisSlug: null },
  batken: { id: 'batken', name: { ru: 'Баткен', ky: 'Баткен' }, twoGisSlug: null },
};

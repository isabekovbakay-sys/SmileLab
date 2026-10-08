/**
 * Единственная точка подключения демо-данных. EXPO_PUBLIC_DEMO подставляется при сборке:
 * в релизной сборке условие ложно, require не выполняется, и Metro не включает
 * демо-модуль в бандл — ни демо-врачей, ни демо-цен, ни демо-текстов.
 * (Обычный import так не умеет: модуль попал бы в бандл всегда.)
 */
export const demo: typeof import('./demo') | null =
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- только так демо не попадает в релиз
  process.env.EXPO_PUBLIC_DEMO === '1' ? (require('./demo') as typeof import('./demo')) : null;

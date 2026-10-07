/**
 * Заглушка @expo/ui для Android (подключается в metro.config.js).
 *
 * @expo/ui (Jetpack Compose, несколько МБ) нужен expo-router только для Stack.Toolbar,
 * которого в приложении нет. Нативная часть исключена из сборки (package.json → expo.autolinking),
 * но expo-router импортирует JS @expo/ui при запуске, а тот сразу ищет нативный модуль ExpoUI
 * и без него роняет приложение. Заглушка отдаёт пустые компоненты и функции вместо настоящих.
 *
 * Если когда-нибудь понадобится Stack.Toolbar: уберите исключение из package.json
 * и подмену из metro.config.js.
 */
function Noop() {
  return null;
}

const handler = {
  get(_target, key) {
    if (key === '__esModule') return true;
    if (key === 'default') return stub;
    if (typeof key === 'symbol' || key === 'then') return undefined;
    return stub;
  },
  apply() {
    return null;
  },
};

const stub = new Proxy(Noop, handler);

module.exports = stub;

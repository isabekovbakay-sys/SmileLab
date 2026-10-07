/**
 * «Удалить мои данные с телефона»: SecureStore (профиль), все ключи AsyncStorage приложения
 * (записи, настройки, старые версии профиля) и кэши в памяти (слоты, каталог).
 * Зависимости передаются явно — логика проверяется тестом без телефона.
 */
export interface WipeDeps {
  deleteSecure: (keys: string[]) => Promise<void>;
  listAppKeys: () => Promise<string[]>;
  removeRawKeys: (keys: string[]) => Promise<void>;
  clearCaches: () => void;
}

export async function wipeLocalData(deps: WipeDeps, secureKeyList: string[]): Promise<void> {
  await deps.deleteSecure(secureKeyList);
  await deps.removeRawKeys(await deps.listAppKeys());
  deps.clearCaches();
}

import { useCallback, useEffect, useState } from 'react';

type Entry = { status: 'pending'; promise: Promise<unknown> } | { status: 'ready'; data: unknown };

/** Кэш в памяти + общий промис на один ключ: два экрана не делают двойной запрос. */
const cache = new Map<string, Entry>();

function load<T>(key: string, loader: () => Promise<T>, keep: boolean): Promise<T> {
  const entry = cache.get(key);
  if (entry?.status === 'pending') return entry.promise as Promise<T>;
  const promise = loader().then(
    (data) => {
      if (keep) cache.set(key, { status: 'ready', data });
      else cache.delete(key);
      return data;
    },
    (error: unknown) => {
      cache.delete(key);
      throw error;
    },
  );
  cache.set(key, { status: 'pending', promise });
  return promise;
}

export type ResourceState<T> =
  | { status: 'idle'; data: undefined; error: undefined }
  | { status: 'loading'; data: undefined; error: undefined }
  | { status: 'ready'; data: T; error: undefined }
  | { status: 'error'; data: undefined; error: unknown };

function initialState<T>(key: string | null): ResourceState<T> {
  if (key === null) return { status: 'idle', data: undefined, error: undefined };
  const entry = cache.get(key);
  if (entry?.status === 'ready') return { status: 'ready', data: entry.data as T, error: undefined };
  return { status: 'loading', data: undefined, error: undefined };
}

/** Сбросить кэш по префиксу ключа (например, после смены источника данных). */
export function invalidateResources(prefix = ''): void {
  for (const key of [...cache.keys()]) if (key.startsWith(prefix)) cache.delete(key);
}

/**
 * Загрузка данных с кэшем. Ключ null — ничего не загружать.
 * `cache: false` — не хранить результат (слоты всегда свежие).
 */
export function useResource<T>(key: string | null, loader: () => Promise<T>, options: { cache?: boolean } = {}) {
  const keep = options.cache !== false;
  const [state, setState] = useState<ResourceState<T>>(() => initialState<T>(key));
  const [stateKey, setStateKey] = useState(key);

  // Смена ключа — производное состояние: сбрасываем во время render, а не в эффекте.
  if (stateKey !== key) {
    setStateKey(key);
    setState(initialState<T>(key));
  }

  const status = stateKey === key ? state.status : initialState<T>(key).status;

  useEffect(() => {
    if (key === null || status !== 'loading') return;
    let active = true;
    load(key, loader, keep).then(
      (data) => {
        if (active) setState({ status: 'ready', data, error: undefined });
      },
      (error: unknown) => {
        if (active) setState({ status: 'error', data: undefined, error });
      },
    );
    return () => {
      active = false;
    };
  }, [key, loader, keep, status]);

  const reload = useCallback(() => {
    if (key === null) return;
    cache.delete(key);
    setState({ status: 'loading', data: undefined, error: undefined });
  }, [key]);

  return { ...state, reload };
}

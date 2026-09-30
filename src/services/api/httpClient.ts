import { SlotUnavailableError } from '../types';

/** Ошибка сервера (кроме 404 и 409, которые обрабатываются отдельно). */
export class HttpError extends Error {
  constructor(
    readonly status: number,
    message = `http-${status}`,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

const TIMEOUT_MS = 15_000;

export interface HttpClient {
  /** 404 → null, 409 → SlotUnavailableError, остальные ошибки → HttpError. */
  request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T | null>;
}

export function createHttpClient(baseUrl: string, timeoutMs = TIMEOUT_MS): HttpClient {
  return {
    async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T | null> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetch(baseUrl + path, {
          method,
          headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        if (response.status === 404) return null;
        if (response.status === 409) throw new SlotUnavailableError();
        if (!response.ok) throw new HttpError(response.status);
        if (response.status === 204) return null;
        return (await response.json()) as T;
      } finally {
        clearTimeout(timer);
      }
    },
  };
}

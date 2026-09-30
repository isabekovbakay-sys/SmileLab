import { createContext, use, useCallback, useMemo, useState, type ReactNode } from 'react';

export type ToastTone = 'neutral' | 'success' | 'error';

export interface ToastMessage {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: ToastMessage | null;
  showToast: (message: string, tone?: ToastTone) => void;
  hideToast: (id?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

/** Очередь из одного тоста: новый заменяет старый. Отображает ToastHost сверху экрана. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, tone: ToastTone = 'neutral') => {
    setToast((prev) => ({ id: (prev?.id ?? 0) + 1, message, tone }));
  }, []);

  const hideToast = useCallback((id?: number) => {
    setToast((prev) => (prev && (id === undefined || prev.id === id) ? null : prev));
  }, []);

  const value = useMemo(() => ({ toast, showToast, hideToast }), [toast, showToast, hideToast]);
  return <ToastContext value={value}>{children}</ToastContext>;
}

export function useToast(): ToastContextValue {
  const context = use(ToastContext);
  if (!context) throw new Error('useToast вне ToastProvider');
  return context;
}

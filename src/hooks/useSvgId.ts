import { useId } from 'react';

/** Уникальный id для градиентов SVG: иначе на web градиенты разных экземпляров «перепутываются». */
export function useSvgId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

/**
 * Подбор размера display-заголовка под ширину. Кыргызские слова длиннее русских,
 * поэтому размер считается от самой длинной строки. Коэффициент — средняя ширина
 * символа Inter Bold в долях кегля (с запасом на широкие буквы: Ж, Ш, Ө, Ү).
 */
export function fitFontSize({
  lines,
  width,
  maxSize,
  minSize,
  charWidth = 0.6,
}: {
  lines: string[];
  width: number;
  maxSize: number;
  minSize: number;
  charWidth?: number;
}): number {
  if (width <= 0) return maxSize;
  const longest = lines.reduce((max, line) => Math.max(max, line.length), 1);
  const fitted = Math.floor(width / (longest * charWidth));
  return Math.max(minSize, Math.min(maxSize, fitted));
}

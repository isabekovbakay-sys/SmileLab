import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { colors } from '../src/theme/colors';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1! + 0.05) / (l2! + 0.05);
}

describe('контраст текста (WCAG AA ≥ 4.5)', () => {
  const pairs: [string, string, string][] = [
    ['textPrimary / background', colors.textPrimary, colors.background],
    ['textSecondary / background', colors.textSecondary, colors.background],
    ['textMuted / background', colors.textMuted, colors.background],
    ['textMuted / surface', colors.textMuted, colors.surface],
    ['textSecondary / surfaceMuted', colors.textSecondary, colors.surfaceMuted],
    ['textSecondary / surfaceTinted', colors.textSecondary, colors.surfaceTinted],
    ['textLink / surface', colors.textLink, colors.surface],
    ['onPrimary / primary', colors.onPrimary, colors.primary],
    ['onAccent / accent', colors.onAccent, colors.accent],
    ['textOnHero / hero', colors.textOnHero, colors.hero],
    ['textOnHeroMuted / hero', colors.textOnHeroMuted, colors.hero],
    ['textOnHeroMuted / heroDeep', colors.textOnHeroMuted, colors.heroDeep],
    ['textOnHeroMuted / primary', colors.textOnHeroMuted, colors.primary],
    ['hero / surface (кнопка «Записаться» в меню)', colors.hero, colors.white],
    ['hero / surfaceTinted', colors.hero, colors.surfaceTinted],
    ['warning / warningSoft', colors.warning, colors.warningSoft],
    ['success / successSoft', colors.success, colors.successSoft],
    ['error / errorSoft', colors.error, colors.errorSoft],
    ['error / surface', colors.error, colors.surface],
    ['brandWhatsApp / surfaceTinted (иконка)', colors.brandWhatsApp, colors.surfaceTinted],
  ];
  for (const [name, fg, bg] of pairs) {
    it(name, () => {
      const ratio = contrast(fg, bg);
      assert.ok(ratio >= (name.includes('иконка') ? 3 : 4.5), `${name}: ${ratio.toFixed(2)}`);
    });
  }
});

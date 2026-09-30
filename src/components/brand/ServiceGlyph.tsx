import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { colors } from '@/theme';
import type { ServiceGlyph as Glyph } from '@/types/domain';

/** Контур зуба на сетке 24×24. */
const TOOTH =
  'M12 5.2c-1.5 0-2.7-1.2-4.9-1.2C4.3 4 2.5 6.2 2.5 9.2c0 3.4 1.5 5 2.2 8.2.6 2.8 1.1 4.6 2.6 4.6 1.6 0 1.9-2.2 2.4-4.3.4-1.7 1.1-2.5 2.3-2.5s1.9.8 2.3 2.5c.5 2.1.8 4.3 2.4 4.3 1.5 0 2-1.8 2.6-4.6.7-3.2 2.2-4.8 2.2-8.2 0-3-1.8-5.2-4.6-5.2-2.2 0-3.4 1.2-4.9 1.2Z';

interface ServiceGlyphProps {
  glyph: Glyph;
  size?: number;
  color?: string;
  accent?: string;
}

/** Фирменные иконки услуг: зуб + отличительная деталь. Декоративные — скрыты от диктора. */
export function ServiceGlyph({ glyph, size = 24, color = colors.hero, accent = colors.accent }: ServiceGlyphProps) {
  const stroke = { stroke: color, strokeWidth: 1.7, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  const accentStroke = { ...stroke, stroke: accent, strokeWidth: 1.9 };

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {glyph === 'implant' ? (
        <>
          <Path d="M12 3.6c-1 0-1.8-.8-3.3-.8-1.9 0-3.1 1.5-3.1 3.5 0 1.5.6 2.5 1 3.5h10.8c.4-1 1-2 1-3.5 0-2-1.2-3.5-3.1-3.5-1.5 0-2.3.8-3.3.8Z" {...stroke} />
          <Path d="M9.6 10v2.2h4.8V10" {...stroke} />
          <Path d="M9.8 12.2 10.6 21h2.8l.8-8.8" {...stroke} />
          <Path d="M9.3 14.6h5.4M9.6 17.2h4.8M10 19.6h4" {...accentStroke} strokeWidth={1.5} />
        </>
      ) : glyph === 'prosthetics' ? (
        <>
          <Path d={TOOTH} {...stroke} />
          <Path d="M4 10.5c2.6 1.2 5.3 1.8 8 1.8s5.4-.6 8-1.8" {...accentStroke} />
        </>
      ) : glyph === 'orthodontics' ? (
        <>
          <Path d="M7.2 6.5c-.9 0-1.5-.7-2.8-.7-1.6 0-2.4 1.3-2.4 3 0 2 .9 2.9 1.3 4.8.4 1.7.7 3.4 1.6 3.4s1.2-1.4 1.5-2.6c.2-1 .5-1.5 1-1.5" {...stroke} />
          <Path d="M16.8 6.5c.9 0 1.5-.7 2.8-.7 1.6 0 2.4 1.3 2.4 3 0 2-.9 2.9-1.3 4.8-.4 1.7-.7 3.4-1.6 3.4s-1.2-1.4-1.5-2.6c-.2-1-.5-1.5-1-1.5" {...stroke} />
          <Path d="M12 6.8c-.9 0-1.5-.6-2.6-.6-1.3 0-2 1.1-2 2.6 0 1.8.8 2.6 1.1 4.2.3 1.5.6 3 1.4 3s1.1-1.2 1.3-2.3c.1-.8.4-1.3.8-1.3s.7.5.8 1.3c.2 1.1.5 2.3 1.3 2.3s1.1-1.5 1.4-3c.3-1.6 1.1-2.4 1.1-4.2 0-1.5-.7-2.6-2-2.6-1.1 0-1.7.6-2.6.6Z" {...stroke} />
          <Path d="M2.5 10.2h19" {...accentStroke} />
          <Rect x={4} y={9.2} width={2} height={2} rx={0.4} fill={accent} />
          <Rect x={11} y={9.2} width={2} height={2} rx={0.4} fill={accent} />
          <Rect x={18} y={9.2} width={2} height={2} rx={0.4} fill={accent} />
        </>
      ) : (
        <>
          <Path d={TOOTH} {...stroke} />
          {glyph === 'consultation' ? <Path d="m8.6 9.6 2.2 2.2 4.4-4.4" {...accentStroke} /> : null}
          {glyph === 'hygiene' ? (
            <Path d="M19.5 1.8v3.4M17.8 3.5h3.4M5.6 12.2v2.2M4.5 13.3h2.2" {...accentStroke} />
          ) : null}
          {glyph === 'caries' ? <Circle cx={14.6} cy={9} r={1.7} fill={accent} /> : null}
          {glyph === 'endo' ? <Path d="M9.4 9.5v5.2M14.6 9.5v5.2" {...accentStroke} /> : null}
          {glyph === 'extraction' ? <Path d="M12 13.2V8.4m-2.2 2.2L12 8.4l2.2 2.2" {...accentStroke} /> : null}
        </>
      )}
    </Svg>
  );
}

/**
 * Кыргызские падежные аффиксы для времени: «19:00га чейин», «14:00кө чейин», «10:00дон».
 * Аффикс зависит от последнего произносимого слова числа (гармония гласных
 * и звонкость последнего согласного), поэтому считаем его, а не пишем вручную.
 */
type KyCase = 'dat' | 'loc' | 'abl';

const UNITS = ['нөл', 'бир', 'эки', 'үч', 'төрт', 'беш', 'алты', 'жети', 'сегиз', 'тогуз'];
const TENS = ['', 'он', 'жыйырма', 'отуз', 'кырк', 'элүү'];

/** Последнее произносимое слово числа 0–59. */
function lastSpokenWord(n: number): string {
  if (n === 0) return UNITS[0]!;
  const unit = n % 10;
  if (unit !== 0) return UNITS[unit]!;
  return TENS[Math.floor(n / 10)] ?? UNITS[0]!;
}

const VOICELESS = new Set(['к', 'п', 'с', 'т', 'ф', 'х', 'ц', 'ч', 'ш', 'щ']);
const VOWELS = 'аеёиоөуүыэюя';

function harmonyVowel(word: string): 'а' | 'е' | 'о' | 'ө' {
  for (let i = word.length - 1; i >= 0; i -= 1) {
    const ch = word[i]!;
    if (!VOWELS.includes(ch)) continue;
    if (ch === 'о' || ch === 'ё') return 'о';
    if (ch === 'ө' || ch === 'ү') return 'ө';
    if (ch === 'е' || ch === 'и' || ch === 'э') return 'е';
    return 'а'; // а, ы, у, ю, я
  }
  return 'а';
}

export function kySuffix(word: string, grammaticalCase: KyCase): string {
  const last = word[word.length - 1] ?? '';
  const voiceless = VOICELESS.has(last);
  const vowel = harmonyVowel(word);
  switch (grammaticalCase) {
    case 'dat':
      return (voiceless ? 'к' : 'г') + vowel;
    case 'loc':
      return (voiceless ? 'т' : 'д') + vowel;
    case 'abl':
      return (voiceless ? 'т' : 'д') + vowel + 'н';
  }
}

/** «19:00» + dat → «19:00га», «14:00» + dat → «14:00кө», «09:00» + loc → «09:00да». */
export function kyTime(time: string, grammaticalCase: KyCase): string {
  const [h, m] = time.split(':').map(Number);
  const spoken = m ? lastSpokenWord(m) : lastSpokenWord(h ?? 0);
  return time + kySuffix(spoken, grammaticalCase);
}

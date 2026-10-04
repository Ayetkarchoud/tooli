// Text helpers: case- and accent-insensitive matching ("prepa" finds "Prépa").

// normalize('NFD') splits accented letters into the letter + a separate accent mark
// ("é" → "e" + "́"). The accent marks are the Unicode block U+0300–U+036F
// ("combining diacritical marks"), so removing that range leaves the plain letters.
export const normalise = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

// Does `text` contain `query` anywhere? (search boxes)
export const matches = (text, query) => normalise(text).includes(normalise(query.trim()))

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Does `text` contain `word` (or phrase) as a whole word? "excellent" does NOT contain "cell".
export function hasWord(text, word) {
  const pattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(normalise(word))}(?=[^\\p{L}\\p{N}]|$)`, 'u')
  return pattern.test(normalise(text))
}

// Prices in Tunisian dinars, written the local way for each language:
// 45 → "45 TND" (en), "45 DT" (fr), "45 د.ت" (ar, Latin digits). 67.5 → "67.5" / "67,5".

import i18n, { currentLanguage, localeOf } from './i18n.js'

const NBSP = String.fromCharCode(0xa0) // non-breaking space

export function formatTND(amount, lang = currentLanguage()) {
  const number = new Intl.NumberFormat(localeOf(lang), { maximumFractionDigits: 1 }).format(amount)
  // non-breaking spaces: a price never splits over two lines ("59" / "د.ت")
  return i18n.t('money.tnd', { lng: lang, amount: number }).replace(/ /g, NBSP)
}

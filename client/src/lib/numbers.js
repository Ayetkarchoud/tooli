// Numbers in the student's language (Latin digits everywhere, also in Arabic):
//   formatNumber(1204) → "1,204" (en), "1 204" (fr), "1,204" (ar)
//   formatRating(4.8)  → "4.8" (en), "4,8" (fr), "4.8" (ar)
//   formatPercent(60)  → "60%" (en), "60 %" (fr), "60%" (ar)

import { currentLanguage, localeOf } from './i18n.js'

export const formatNumber = (value, lang = currentLanguage(), options) =>
  new Intl.NumberFormat(localeOf(lang), options).format(value)

export const formatRating = (value, lang = currentLanguage()) =>
  formatNumber(value, lang, { minimumFractionDigits: 1, maximumFractionDigits: 1 })

// value: 0–100
export const formatPercent = (value, lang = currentLanguage()) =>
  formatNumber(value / 100, lang, { style: 'percent', maximumFractionDigits: 0 })

// Dates and times in the student's language (en-GB, fr-TN, ar-TN with Latin digits) and local time zone.
// Every function takes an optional `lang`; by default it uses the current language.

import i18n, { currentLanguage, localeOf } from './i18n.js'

const rtf = (lang) => new Intl.RelativeTimeFormat(localeOf(lang), { numeric: 'auto' })

// A Date → its LOCAL calendar day 'YYYY-MM-DD' (not UTC like toISOString)
export function localDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const fromKey = (isoDate) => {
  const [y, m, d] = isoDate.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// "just now", "5 min ago", "3 h ago", "yesterday", "Mon", "12 Sept" (in the current language)
export function timeAgo(iso, lang = currentLanguage(), now = new Date()) {
  const date = new Date(iso)
  const minutes = Math.round((now - date) / 60_000)
  if (minutes < 1) return i18n.t('time.justNow', { lng: lang })
  if (minutes < 60) return rtf(lang).format(-minutes, 'minute')
  if (minutes < 24 * 60 && date.getDate() === now.getDate()) return rtf(lang).format(-Math.round(minutes / 60), 'hour')

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return rtf(lang).format(-1, 'day')
  if (minutes < 7 * 24 * 60) return date.toLocaleDateString(localeOf(lang), { weekday: 'short' })
  return date.toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'short' })
}

// 45 → "45 min", 106 → "1 h 46 min", 120 → "2 h" (units from the translation files)
export function formatDuration(minutes, lang = currentLanguage()) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return i18n.t('time.minutes', { lng: lang, m })
  return i18n.t(m ? 'time.hoursMinutes' : 'time.hours', { lng: lang, h, m })
}

// 'YYYY-MM-DD' → "Today", "Tomorrow", "Sat 3 Oct" (capitalised for headings and cards)
export function formatSlotDay(isoDate, lang = currentLanguage(), now = new Date()) {
  const date = fromKey(isoDate)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((date - today) / 86_400_000)
  const text =
    diff === 0 || diff === 1
      ? rtf(lang).format(diff, 'day')
      : date.toLocaleDateString(localeOf(lang), { weekday: 'short', day: 'numeric', month: 'short' })
  return text.charAt(0).toLocaleUpperCase(localeOf(lang)) + text.slice(1)
}

// 'YYYY-MM-DD' → { weekday: 'Sat', narrow: 'S', day: 3, month: 'Oct', long: 'Saturday 3 October' } (day pickers)
export function dayParts(isoDate, lang = currentLanguage()) {
  const date = fromKey(isoDate)
  const locale = localeOf(lang)
  return {
    weekday: date.toLocaleDateString(locale, { weekday: 'short' }),
    narrow: date.toLocaleDateString(locale, { weekday: 'narrow' }),
    day: date.toLocaleDateString(locale, { day: 'numeric' }),
    month: date.toLocaleDateString(locale, { month: 'short' }),
    long: date.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }),
  }
}

// "Sunday 4 October" (dashboard greeting)
export const formatToday = (lang = currentLanguage(), now = new Date()) =>
  now.toLocaleDateString(localeOf(lang), { weekday: 'long', day: 'numeric', month: 'long' })

// A calendar date 'YYYY-MM-DD' → "27 October"
export const formatDate = (isoDate, lang = currentLanguage()) =>
  fromKey(isoDate).toLocaleDateString(localeOf(lang), { day: 'numeric', month: 'long' })

// ISO date-time (any time zone) → "17:00" in the student's local time
export const formatTime = (iso, lang = currentLanguage()) =>
  new Date(iso).toLocaleTimeString(localeOf(lang), { hour: '2-digit', minute: '2-digit', hour12: false })

// ISO date-time → "Tomorrow at 17:00", "Sat 3 Oct at 09:30" (student's local time)
export const formatSlotStart = (iso, lang = currentLanguage()) =>
  i18n.t('time.slotAt', { lng: lang, day: formatSlotDay(localDateKey(new Date(iso)), lang), time: formatTime(iso, lang) })

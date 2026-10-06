// Helpers for the FAKE services in this folder.
// Every service function returns mock data after a short delay, like a real API would.
// When the Express API is ready, each function swaps its body for the api.* call in its TODO,
// and this file can be deleted.

// Wait 300–600 ms (or a custom range), so loading states can be seen and tested
export const wait = (min = 300, max = 600) =>
  new Promise((resolve) => setTimeout(resolve, min + Math.random() * (max - min)))

// ISO date strings relative to now, so the fake data always looks recent
export const minutesAgo = (minutes) => new Date(Date.now() - minutes * 60_000).toISOString()
export const hoursAgo = (hours) => minutesAgo(hours * 60)
export const daysAgo = (days) => minutesAgo(days * 24 * 60)

// Return copies, so pages can't accidentally change the fake "database"
export const copy = (value) => structuredClone(value)

// Text search helper, shared with the pages
export { matches } from '../lib/text.js'

// The language the fake API "answers" in. The real API reads the Accept-Language header
// (set by src/api/client.js); the fakes read the current language directly.
export { currentLanguage } from '../lib/i18n.js'

// Pick the text for the current language from { en, fr, ar } (fallback: French, like the API)
import { currentLanguage as lang } from '../lib/i18n.js'
export const pick = (texts, language = lang()) => texts?.[language] ?? texts?.fr ?? texts?.en

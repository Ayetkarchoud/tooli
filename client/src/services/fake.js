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

// Case- and accent-insensitive text match ("prepa" finds "Prépa")
const normalise = (text) => text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
export const matches = (text, query) => normalise(text).includes(normalise(query.trim()))

// The logged-in user's profile and settings (FAKE for now: see docs/api.md).
// Name and email come from the session (useAuth); this adds the rest of the profile.
// Theme/palette are handled by ThemeProvider (saved in the browser for now).
// level, section and city are ids (see src/data/profileOptions.js); language = 'en' | 'fr' | 'ar'.

import { copy, currentLanguage, pick, wait } from './fake.js'

let profile = {
  level: 'bac',
  section: 'mathematics',
  school: 'Lycée pilote de Monastir',
  city: 'monastir',
  bio: '',
  language: currentLanguage(),
}

const NAME_REQUIRED = {
  en: 'Please enter your first and last name.',
  fr: 'Indique ton prénom et ton nom.',
  ar: 'أدخل اسمك ولقبك.',
}

let notificationSettings = {
  courseReminders: true,
  bookingUpdates: true,
  dailyTip: true,
  productNews: false,
}

// Change the user's name (it lives on the user, shown everywhere). Returns the saved names;
// the page then calls updateUser() from useAuth so the greeting and avatar change at once.
// TODO(backend): (await api.put('/users/me', { firstName, lastName })).user
export async function updateName({ firstName, lastName }) {
  await wait()
  const clean = { firstName: firstName.trim(), lastName: lastName.trim() }
  if (!clean.firstName || !clean.lastName) throw new Error(pick(NAME_REQUIRED))
  return clean
}

// TODO(backend): api.get('/users/me/profile')
export async function getProfile() {
  await wait()
  return copy(profile)
}

// Send only the fields that changed (e.g. { language: 'ar' } from the language switcher); get the full profile back
// TODO(backend): api.patch('/users/me/profile', changes)
export async function updateProfile(changes) {
  await wait()
  profile = { ...profile, ...changes }
  return copy(profile)
}

// TODO(backend): api.get('/users/me/settings/notifications')
export async function getNotificationSettings() {
  await wait()
  return copy(notificationSettings)
}

// TODO(backend): api.put('/users/me/settings/notifications', changes)
export async function updateNotificationSettings(changes) {
  await wait()
  notificationSettings = { ...notificationSettings, ...changes }
  return copy(notificationSettings)
}

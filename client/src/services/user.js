// The logged-in user's profile and settings (FAKE for now: see docs/api.md).
// Name and email come from the session (useAuth); this adds the rest of the profile.
// Theme/palette are handled by ThemeProvider (saved in the browser for now).

import { copy, wait } from './fake.js'

let profile = {
  level: 'Bac',
  section: 'Mathematics',
  school: 'Lycée pilote de Monastir',
  city: 'Monastir',
  bio: '',
}

let notificationSettings = {
  courseReminders: true,
  bookingUpdates: true,
  dailyTip: true,
  productNews: false,
}

// TODO(backend): api.get('/users/me/profile')
export async function getProfile() {
  await wait()
  return copy(profile)
}

// Send only the fields that changed; get the full profile back
// TODO(backend): api.put('/users/me/profile', changes)
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

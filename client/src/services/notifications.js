// Notifications (FAKE for now: see docs/api.md for the real endpoints).
// type: 'course' | 'booking' | 'tip' | 'system'. `link` = where clicking it goes (or null).

import { copy, daysAgo, hoursAgo, minutesAgo, wait } from './fake.js'

const NOTIFICATIONS = [
  {
    id: 'n1', type: 'booking', read: false, createdAt: minutesAgo(25),
    title: 'Class confirmed',
    body: 'Your session with Prof. Amel Exemple is booked for Saturday at 10:30.',
    link: '/dashboard/professors/amel-exemple',
  },
  {
    id: 'n2', type: 'course', read: false, createdAt: hoursAgo(5),
    title: 'New lesson available',
    body: '“Absolute values” is now open in Algebra basics. You are 60% through the course!',
    link: '/dashboard/courses/algebra-basics',
  },
  {
    id: 'n3', type: 'tip', read: false, createdAt: daysAgo(1),
    title: 'Tip of the day',
    body: 'Test yourself instead of re-reading. Recalling an answer makes it stick far better.',
    link: null,
  },
  {
    id: 'n4', type: 'course', read: true, createdAt: daysAgo(2),
    title: 'Keep your streak going',
    body: 'You haven’t opened Python for beginners in 3 days. Ten minutes today?',
    link: '/dashboard/courses/python-beginners',
  },
  {
    id: 'n5', type: 'system', read: true, createdAt: daysAgo(5),
    title: 'Welcome to tooli!',
    body: 'Ask the AI tutor, follow partner courses or book a VIP professor. We’re happy you’re here.',
    link: '/dashboard',
  },
  {
    id: 'n6', type: 'booking', read: true, createdAt: daysAgo(8),
    title: 'How was your class?',
    body: 'Rate your session with Dr. Karim Demo to help other students choose.',
    link: '/dashboard/professors/karim-demo',
  },
]

// FAKE only: lets other fake services create a notification (e.g. after a booking).
// The real backend creates these itself, so there is no endpoint for it.
export function addNotification({ type, title, body, link = null }) {
  NOTIFICATIONS.push({ id: `n${Date.now()}`, type, read: false, createdAt: new Date().toISOString(), title, body, link })
}

// Newest first
// TODO(backend): api.get('/notifications')
export async function listNotifications() {
  await wait()
  return copy([...NOTIFICATIONS].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
}

// TODO(backend): (await api.get('/notifications/unread-count')).count
export async function getUnreadCount() {
  await wait()
  return NOTIFICATIONS.filter((n) => !n.read).length
}

// TODO(backend): api.post(`/notifications/${id}/read`)
export async function markAsRead(id) {
  await wait()
  const found = NOTIFICATIONS.find((n) => n.id === id)
  if (found) found.read = true
}

// TODO(backend): api.post('/notifications/read-all')
export async function markAllAsRead() {
  await wait()
  NOTIFICATIONS.forEach((n) => {
    n.read = true
  })
}

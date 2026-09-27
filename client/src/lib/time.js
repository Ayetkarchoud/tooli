// "just now", "5 min ago", "3 h ago", "Yesterday", "Mon", "12 Sep"
export function timeAgo(iso, now = new Date()) {
  const date = new Date(iso)
  const minutes = Math.round((now - date) / 60_000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes} min ago`
  if (minutes < 24 * 60 && date.getDate() === now.getDate()) return `${Math.round(minutes / 60)} h ago`

  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  if (minutes < 7 * 24 * 60) return date.toLocaleDateString('en-GB', { weekday: 'short' })
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

// 45 → "45 min", 106 → "1 h 46 min", 120 → "2 h"
export function formatDuration(minutes) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} min`
  return m ? `${h} h ${m} min` : `${h} h`
}

// 'YYYY-MM-DD' → "Today", "Tomorrow", "Sat 3 Oct"
export function formatSlotDay(isoDate, now = new Date()) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const diff = Math.round((date - today) / 86_400_000)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

// 'YYYY-MM-DD' → { weekday: 'Sat', day: 3, month: 'Oct' } (for day pickers)
export function dayParts(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return {
    weekday: date.toLocaleDateString('en-GB', { weekday: 'short' }),
    day: d,
    month: date.toLocaleDateString('en-GB', { month: 'short' }),
    long: date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }),
  }
}

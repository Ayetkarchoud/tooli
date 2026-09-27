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

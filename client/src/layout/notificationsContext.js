import { createContext, useContext } from 'react'

export const NotificationsContext = createContext(null)

// { unread, refresh, setUnread } (inside the member area only)
export function useNotifications() {
  const ctx = useContext(NotificationsContext)
  if (!ctx) throw new Error('useNotifications must be used inside <NotificationsProvider>')
  return ctx
}

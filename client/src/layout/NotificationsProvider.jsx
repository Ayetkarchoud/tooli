// The unread notifications count, shared by the member area: the 🔔 dot, the notifications page
// (marking as read updates the dot instantly) and actions that create notifications (bookings).
//   const { unread, refresh, setUnread } = useNotifications()
// setUnread accepts a number or an updater: setUnread((n) => n - 1)

import { useCallback, useEffect, useMemo, useState } from 'react'
import { getUnreadCount } from '@/services/notifications'
import { NotificationsContext } from './notificationsContext.js'

export function NotificationsProvider({ children }) {
  const [unread, setUnreadState] = useState(0)

  const refresh = useCallback(async () => {
    try {
      setUnreadState(await getUnreadCount())
    } catch {
      // the dot is a hint, not critical: keep the last known count
    }
  }, [])

  // Load once when the member area opens
  useEffect(() => {
    let live = true
    getUnreadCount().then(
      (count) => live && setUnreadState(count),
      () => {},
    )
    return () => {
      live = false
    }
  }, [])

  const setUnread = useCallback((next) => {
    setUnreadState((n) => Math.max(0, typeof next === 'function' ? next(n) : next))
  }, [])

  const value = useMemo(() => ({ unread, refresh, setUnread }), [unread, refresh, setUnread])
  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>
}

import { BookOpen, Crown, LayoutDashboard, MessagesSquare, Settings } from 'lucide-react'

// Main links: shown in the sidebar (desktop) and the bottom tab bar (mobile).
// Texts: t(`nav.${key}`) (sidebar) and t(`nav.${key}Short`) (tab bar)
export const MAIN_NAV = [
  { to: '/dashboard', key: 'dashboard', icon: LayoutDashboard, end: true },
  { to: '/dashboard/tutor', key: 'tutor', icon: MessagesSquare },
  { to: '/dashboard/courses', key: 'courses', icon: BookOpen },
  { to: '/dashboard/professors', key: 'professors', icon: Crown },
]

export const SETTINGS_NAV = { to: '/dashboard/settings', key: 'settings', icon: Settings }

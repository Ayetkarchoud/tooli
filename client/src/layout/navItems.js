import { BookOpen, Crown, LayoutDashboard, MessagesSquare, Settings } from 'lucide-react'

// Main links: shown in the sidebar (desktop) and the bottom tab bar (mobile)
export const MAIN_NAV = [
  { to: '/dashboard', label: 'Dashboard', short: 'Home', icon: LayoutDashboard, end: true },
  { to: '/dashboard/tutor', label: 'AI tutor', short: 'Tutor', icon: MessagesSquare },
  { to: '/dashboard/courses', label: 'Partner courses', short: 'Courses', icon: BookOpen },
  { to: '/dashboard/professors', label: 'VIP professors', short: 'VIP', icon: Crown },
]

export const SETTINGS_NAV = { to: '/dashboard/settings', label: 'Settings', icon: Settings }

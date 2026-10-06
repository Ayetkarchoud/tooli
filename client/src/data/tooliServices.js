import { BookOpen, Crown, MessagesSquare, Sparkles } from 'lucide-react'

// The tooli services, shared by the landing page (visitors) and the dashboard (members).
// `slug` is the dashboard sub-route: /dashboard/<slug>. `key` = their texts in the translation files:
// t(`services.${key}.title`), .text (short), .pitch (landing), .cta
export const SERVICES = [
  { key: 'tutor', slug: 'tutor', icon: MessagesSquare },
  { key: 'courses', slug: 'courses', icon: BookOpen },
  { key: 'professors', slug: 'professors', icon: Crown },
  { key: 'soon', slug: null, icon: Sparkles, soon: true },
]

export const servicePath = (slug) => `/dashboard/${slug}`

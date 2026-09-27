import { BookOpen, Crown, MessagesSquare, Sparkles } from 'lucide-react'

// The tooli services, shared by the landing page (visitors) and the dashboard (members).
// `slug` is the dashboard sub-route: /dashboard/<slug>
export const SERVICES = [
  {
    slug: 'tutor',
    title: 'AI tutor',
    text: 'Ask any question and get clear, step-by-step answers.',
    pitch: 'Stuck on homework at midnight? Ask your question and get a clear, step-by-step explanation in seconds.',
    icon: MessagesSquare,
    cta: 'Ask a question',
  },
  {
    slug: 'courses',
    title: 'Partner courses',
    text: 'Hand-picked courses from our e-learning partners.',
    pitch: 'Courses from trusted e-learning platforms, gathered in one place so you can follow your progress easily.',
    icon: BookOpen,
    cta: 'Browse courses',
  },
  {
    slug: 'professors',
    title: 'VIP professors',
    text: 'Live classes with the best professors in Tunisia.',
    pitch: 'Book private live sessions with top-rated professors in Tunisia, at a time that suits you.',
    icon: Crown,
    cta: 'Meet them',
  },
  {
    slug: null,
    title: 'More coming',
    text: 'New services are on the way.',
    pitch: 'We are building new ways to help you learn. Stay tuned.',
    icon: Sparkles,
    soon: true,
  },
]

export const servicePath = (slug) => `/dashboard/${slug}`

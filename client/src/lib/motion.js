// Shared Motion settings, so every page moves the same way.
// Reduced motion: <MotionConfig reducedMotion="user"> (main.jsx) turns off movement,
// and useEntrance / useInView below also skip the fade for those users.

import { useReducedMotion } from 'motion/react'

// One item: fade in with a small upward slide
export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
}

// A parent whose children (using fadeUp) appear one after another
export const stagger = (gap = 0.08) => ({
  hidden: {},
  show: { transition: { staggerChildren: gap } },
})

// Cards: gentle lift on hover, small press on tap
export const liftOnHover = {
  whileHover: { y: -4 },
  whileTap: { scale: 0.98 },
  transition: { type: 'spring', stiffness: 400, damping: 28 },
}

// Animate on mount (e.g. hero, dashboard sections). Spread on a motion element.
export function useEntrance() {
  const reduce = useReducedMotion()
  return { initial: reduce ? false : 'hidden', animate: 'show' }
}

// Animate the first time the element scrolls into view.
export function useInView(amount = 0.2) {
  const reduce = useReducedMotion()
  return { initial: reduce ? false : 'hidden', whileInView: 'show', viewport: { once: true, amount } }
}

// Short fade between routes. Renders the matched child route (like <Outlet />),
// fading the old page out and the new one in. Off for reduced-motion users.
// `pageKey` decides what counts as "a new page" (default: the full path).

import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'

export default function AnimatedOutlet({ pageKey = (pathname) => pathname, className }) {
  const { pathname } = useLocation()
  const outlet = useOutlet()
  const reduce = useReducedMotion()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pageKey(pathname)}
        className={className}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={reduce ? undefined : { opacity: 0 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}

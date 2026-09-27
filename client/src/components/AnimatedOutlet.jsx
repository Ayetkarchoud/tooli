// Short fade between routes. Renders the matched child route (like <Outlet />),
// fading the old page out and the new one in. Off for reduced-motion users.
// `pageKey` decides what counts as "a new page" (default: the full path).
// Pages are lazy-loaded: while one downloads, only this area shows <PageLoader />
// (so the app layout around it stays put). `fullScreen` = the loader fills the screen.

import { Suspense } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useLocation, useOutlet } from 'react-router-dom'
import PageLoader from './PageLoader.jsx'

export default function AnimatedOutlet({ pageKey = (pathname) => pathname, fullScreen = false, className }) {
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
        <Suspense fallback={<PageLoader fullScreen={fullScreen} />}>{outlet}</Suspense>
      </motion.div>
    </AnimatePresence>
  )
}

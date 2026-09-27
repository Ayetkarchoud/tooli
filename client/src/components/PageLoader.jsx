// Shown while a page's code is downloading (React.lazy + Suspense).
// Three dots, like the mascot's "thinking" pose. It fades in after a short delay,
// so fast loads show nothing at all. Takes the page's space, so nothing jumps.

import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

export default function PageLoader({ fullScreen = false }) {
  return (
    <motion.div
      role="status"
      className={cn('grid place-items-center', fullScreen ? 'min-h-screen' : 'min-h-[50vh]')}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.2 }}
    >
      <span className="flex gap-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="size-2.5 rounded-full bg-primary"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
          />
        ))}
      </span>
      <span className="sr-only">Loading…</span>
    </motion.div>
  )
}

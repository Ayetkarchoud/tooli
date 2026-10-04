// "Good afternoon, Ayet" + a friendly line that changes every few seconds (it depends on the time of day).
// Late at night the mascot is sleepy. The line just swaps (no fade) for reduced-motion users.

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import Mascot from '../../components/Mascot.jsx'
import { PAGE_TITLE } from '../../components/PageHeader.jsx'

const PERIODS = {
  morning: {
    hello: 'Good morning',
    lines: ['Ready to learn something new?', 'A fresh start: what’s first today?', 'One small win before lunch?'],
  },
  afternoon: {
    hello: 'Good afternoon',
    lines: ['Ready to learn something new?', 'Perfect time for a quick revision.', 'One lesson now, one step closer to the bac.'],
  },
  evening: {
    hello: 'Good evening',
    lines: ['A short session before dinner?', 'Review today, remember tomorrow.', 'Ready to learn something new?'],
  },
  night: {
    hello: 'Good evening',
    lines: ['Late study session? Don’t forget to sleep!', 'Your brain stores what you learned while you sleep.'],
  },
}

function periodOf(hour) {
  if (hour < 5 || hour >= 22) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export default function Greeting({ firstName }) {
  const reduce = useReducedMotion()
  const now = new Date()
  const period = PERIODS[periodOf(now.getHours())]
  const [line, setLine] = useState(() => Math.floor(Math.random() * period.lines.length))
  const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  useEffect(() => {
    const timer = setInterval(() => setLine((i) => (i + 1) % period.lines.length), 9000)
    return () => clearInterval(timer)
  }, [period.lines.length])

  return (
    <div className="flex items-center gap-4 max-[560px]:gap-3">
      <Mascot
        pose={period === PERIODS.night ? 'sleepy' : 'waving'}
        size={72}
        title=""
        aria-hidden="true"
        className="shrink-0 max-[560px]:h-auto max-[560px]:w-[56px]"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-muted-foreground">{today}</p>
        <h1 className={PAGE_TITLE}>
          {period.hello}, {firstName}
        </h1>
        {/* fixed height (2 lines on phones, 1 above) so the swap never moves the page */}
        <p className="relative mt-1 h-12 overflow-hidden text-muted-foreground sm:h-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={line}
              className="absolute inset-x-0 line-clamp-2 sm:truncate"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {period.lines[line]}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>
    </div>
  )
}

// "Good afternoon, Ayet" + a friendly line that changes every few seconds (it depends on the time of day).
// Texts: dashboard.greeting.<period>.hello and .lines (a list).
// Late at night the mascot is sleepy. The line just swaps (no fade) for reduced-motion users.

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { formatToday } from '@/lib/time'
import Mascot from '../../components/Mascot.jsx'
import { PAGE_TITLE } from '../../components/PageHeader.jsx'

function periodOf(hour) {
  if (hour < 5 || hour >= 22) return 'night'
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

export default function Greeting({ firstName }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const now = new Date()
  const period = periodOf(now.getHours())
  const lines = t(`dashboard.greeting.${period}.lines`, { returnObjects: true })
  const count = Array.isArray(lines) ? lines.length : 1
  const [line, setLine] = useState(() => Math.floor(Math.random() * 3))

  useEffect(() => {
    const timer = setInterval(() => setLine((i) => i + 1), 9000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="flex items-center gap-4 max-[560px]:gap-3">
      <Mascot
        pose={period === 'night' ? 'sleepy' : 'waving'}
        size={72}
        title=""
        aria-hidden="true"
        className="shrink-0 max-[560px]:h-auto max-[560px]:w-[56px]"
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold text-muted-foreground">{formatToday()}</p>
        <h1 className={PAGE_TITLE}>
          {t(`dashboard.greeting.${period}.hello`, { name: firstName })}
        </h1>
        {/* fixed height (2 lines on phones, 1 above) so the swap never moves the page */}
        <p className="relative mt-1 h-12 overflow-hidden text-muted-foreground sm:h-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={line % count}
              className="absolute inset-x-0 line-clamp-2 sm:truncate"
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {Array.isArray(lines) ? lines[line % count] : lines}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>
    </div>
  )
}

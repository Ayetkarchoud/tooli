// Shown while a page's code is downloading (React.lazy + Suspense).
// Inside the member area: a page-shaped skeleton (title + cards), so nothing jumps.
// Full screen (landing, login…): the thinking mascot + three dots.
// Both fade in after a short delay, so fast loads show nothing at all.

import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import Mascot from './Mascot.jsx'
import Page from './Page.jsx'

const appear = { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2, duration: 0.2 } }

// Reusable skeleton blocks for pages that load their data
export function CardGridSkeleton({ count = 3, className = 'h-40' }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={`rounded-2xl ${className}`} />
      ))}
    </div>
  )
}

export function PageSkeleton() {
  return (
    <Page as="div">
      <Skeleton className="h-9 w-56 rounded-lg" />
      <Skeleton className="mt-3 mb-8 h-5 w-80 max-w-full" />
      <CardGridSkeleton count={6} />
    </Page>
  )
}

export default function PageLoader({ fullScreen = false }) {
  const { t } = useTranslation()
  if (!fullScreen) {
    return (
      <motion.div role="status" {...appear}>
        <PageSkeleton />
        <span className="sr-only">{t('common.loading')}</span>
      </motion.div>
    )
  }

  return (
    <motion.div role="status" className="flex min-h-screen flex-col items-center justify-center gap-4" {...appear}>
      <Mascot pose="thinking" size={84} title="" aria-hidden="true" />
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
      <span className="sr-only">{t('common.loading')}</span>
    </motion.div>
  )
}

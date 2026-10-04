// "Your week": days studied (7 dots, Monday → Sunday), questions asked to the tutor, lessons done,
// and the next booked class (or a "Book a class" link). Data from services/week.js.

import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, BookOpenCheck, CalendarCheck, CalendarPlus, MessagesSquare, RefreshCw } from 'lucide-react'
import { fullName } from '@/lib/people'
import { liftOnHover } from '@/lib/motion'
import { dayParts, formatSlotStart, localDateKey } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getWeekSummary } from '@/services/week'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const MotionLink = motion.create(Link)
const TILE = 'flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-foreground no-underline'
const LINK_TILE = cn(TILE, 'group transition-[border-color,box-shadow] hover:border-primary hover:shadow-lift')

function StatLink({ to, icon: Icon, value, label, cta }) {
  return (
    <MotionLink to={to} className={LINK_TILE} {...liftOnHover}>
      <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <Icon size={16} className="text-primary-text" aria-hidden="true" /> {label}
      </span>
      <span className="text-3xl leading-none font-extrabold">{value}</span>
      <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-text">
        {cta} <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </MotionLink>
  )
}

function DaysStudied({ days }) {
  const today = localDateKey(new Date())
  const past = days.filter((d) => d.studied !== null)
  const studied = past.filter((d) => d.studied).length

  return (
    <div className={TILE}>
      <span className="text-sm font-semibold text-muted-foreground">Days studied</span>
      <span className="text-3xl leading-none font-extrabold">
        {studied}
        <span className="text-base font-semibold text-muted-foreground"> / {past.length} so far</span>
      </span>
      <ol className="mt-auto flex justify-between gap-1 pt-1" aria-label="This week, Monday to Sunday">
        {days.map((d) => {
          const { weekday, long } = dayParts(d.date)
          const isToday = d.date === today
          const state = d.studied === null ? 'still to come' : d.studied ? 'studied' : 'no study'
          return (
            <li key={d.date} className="flex flex-col items-center gap-1">
              <span
                className={cn(
                  'size-4 rounded-full',
                  d.studied === true && 'bg-primary',
                  d.studied === false && 'bg-muted-foreground/25',
                  d.studied === null && 'border-2 border-dashed border-border',
                  isToday && 'ring-2 ring-primary-text ring-offset-2 ring-offset-card',
                )}
                aria-hidden="true"
              />
              <span className={cn('text-[11px] font-semibold text-muted-foreground', isToday && 'text-foreground')} aria-hidden="true">
                {weekday[0]}
              </span>
              <span className="sr-only">
                {long}
                {isToday ? ' (today)' : ''}: {state}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function NextClass({ booking }) {
  if (!booking) {
    return (
      <MotionLink to="/dashboard/professors" className={LINK_TILE} {...liftOnHover}>
        <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
          <CalendarPlus size={16} className="text-primary-text" aria-hidden="true" /> Next class
        </span>
        <span className="text-lg leading-snug font-bold">No class booked yet</span>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-primary-text">
          Book a class <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
      </MotionLink>
    )
  }
  const prof = booking.professor
  return (
    <MotionLink to={`/dashboard/professors/${prof.id}`} className={LINK_TILE} {...liftOnHover}>
      <span className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
        <CalendarCheck size={16} className="text-primary-text" aria-hidden="true" /> Next class
      </span>
      <span className="text-lg leading-snug font-bold">{formatSlotStart(booking.startsAt)}</span>
      <span className="mt-auto text-sm text-muted-foreground">
        with <span className="font-semibold text-foreground">{fullName(prof)}</span> · {prof.subject}
      </span>
    </MotionLink>
  )
}

export default function YourWeek() {
  const { data, error, loading, reload } = useAsync(getWeekSummary, [])

  return (
    <section aria-labelledby="week-title">
      <h2 id="week-title" className="mb-3.5 text-lg font-semibold">
        Your week
      </h2>
      {loading && !data ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" role="status" aria-label="Loading your week">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[132px] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 text-sm text-muted-foreground" role="alert">
          Your week didn’t load.
          <Button variant="pill" size="sm" onClick={reload}>
            <RefreshCw aria-hidden="true" /> Try again
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="max-[420px]:col-span-2">
            <DaysStudied days={data.days} />
          </div>
          <StatLink to="/dashboard/tutor" icon={MessagesSquare} value={data.questionsAsked} label="Questions asked" cta="Ask another" />
          <StatLink to="/dashboard/courses" icon={BookOpenCheck} value={data.lessonsDone} label="Lessons done" cta="Keep going" />
          <div className="max-[420px]:col-span-2">
            <NextClass booking={data.nextClass} />
          </div>
        </div>
      )}
    </section>
  )
}

// Notifications: grouped by Today / This week / Earlier, All / Unread filter (in the URL),
// click = mark as read + open its link, "Mark all as read". The 🔔 dot updates instantly.

import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { BookOpen, CalendarCheck, CheckCheck, Lightbulb, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { localDateKey, timeAgo } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { listNotifications, markAllAsRead, markAsRead } from '@/services/notifications'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ChipGroup from '../components/ChipGroup.jsx'
import MascotMessage, { ErrorState } from '../components/MascotMessage.jsx'
import Page from '../components/Page.jsx'
import { useNotifications } from '../layout/notificationsContext.js'
import PageHeader from '../components/PageHeader.jsx'

// One icon + palette colour per type, drawn as a soft tinted circle
const TYPES = {
  course: { icon: BookOpen, colour: 'blue', label: 'Course' },
  booking: { icon: CalendarCheck, colour: 'amber', label: 'Booking' },
  tip: { icon: Lightbulb, colour: 'green', label: 'Tip' },
  system: { icon: Sparkles, colour: 'violet', label: 'tooli' },
}

const GROUPS = ['Today', 'This week', 'Earlier']

function groupOf(iso, now = new Date()) {
  const date = new Date(iso)
  if (localDateKey(date) === localDateKey(now)) return 'Today'
  return now - date < 7 * 86_400_000 ? 'This week' : 'Earlier'
}

function TypeIcon({ type }) {
  const { icon: Icon, colour } = TYPES[type] ?? TYPES.system
  const base = `var(--palette-${colour})`
  return (
    <span
      className="grid size-11 shrink-0 place-items-center rounded-full"
      style={{ background: `color-mix(in srgb, ${base} 18%, transparent)`, color: `color-mix(in srgb, ${base} 50%, var(--color-text))` }}
      aria-hidden="true"
    >
      <Icon size={20} />
    </span>
  )
}

function NotificationItem({ n, onOpen }) {
  const reduce = useReducedMotion()
  const content = (
    <>
      <TypeIcon type={n.type} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className={cn('text-[15px]', n.read ? 'font-medium' : 'font-bold')}>{n.title}</span>
          <time dateTime={n.createdAt} className="shrink-0 text-xs text-muted-foreground">
            {timeAgo(n.createdAt)}
          </time>
        </span>
        <span className="mt-0.5 block text-sm leading-relaxed text-muted-foreground">{n.body}</span>
      </span>
      <span className="grid w-3 shrink-0 place-items-center self-center">
        <AnimatePresence initial={false}>
          {!n.read && (
            <motion.span
              key="dot"
              className="size-2.5 rounded-full bg-primary"
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              exit={reduce ? undefined : { scale: 0 }}
            />
          )}
        </AnimatePresence>
      </span>
      <span className="sr-only">
        {n.read ? '' : 'Unread. '}
        {TYPES[n.type]?.label ?? 'tooli'} notification.
      </span>
    </>
  )
  const className = cn(
    'flex w-full items-start gap-3.5 rounded-2xl border px-4 py-3.5 text-left text-foreground no-underline transition-colors duration-300',
    n.read ? 'border-transparent hover:bg-card' : 'border-border bg-card hover:border-primary',
  )

  return n.link ? (
    <Link to={n.link} className={className} onClick={() => onOpen(n)}>
      {content}
    </Link>
  ) : (
    <button type="button" className={className} onClick={() => onOpen(n)}>
      {content}
    </button>
  )
}

export default function Notifications() {
  const [params, setParams] = useSearchParams()
  const onlyUnread = params.get('show') === 'unread'
  const { data, error, loading, reload } = useAsync(listNotifications, [])
  const { setUnread } = useNotifications()
  const entrance = useEntrance()
  const reduce = useReducedMotion()

  // Read changes made on this page (applied on top of the loaded list)
  const [readIds, setReadIds] = useState(() => new Set())
  const [allRead, setAllRead] = useState(false)
  const [markingAll, setMarkingAll] = useState(false)

  const items = data?.map((n) => ({ ...n, read: n.read || allRead || readIds.has(n.id) }))
  const unreadCount = items?.filter((n) => !n.read).length ?? 0
  const shown = items?.filter((n) => !onlyUnread || !n.read) ?? []

  // Keep the 🔔 dot in sync with what this page knows
  useEffect(() => {
    if (data) setUnread(unreadCount)
  }, [data, unreadCount, setUnread]) // eslint-disable-line react-hooks/exhaustive-deps -- items is derived from data

  const open = (n) => {
    if (n.read) return
    setReadIds((ids) => new Set(ids).add(n.id))
    markAsRead(n.id).catch(() => {
      // the dot will be corrected on the next load; no need to bother the student
    })
  }

  const markAll = async () => {
    setMarkingAll(true)
    try {
      await markAllAsRead()
      setAllRead(true)
      toast.success('You’re all caught up!')
    } catch {
      toast.error('Couldn’t mark them as read', { description: 'Check your connection and try again.' })
    } finally {
      setMarkingAll(false)
    }
  }

  const setShow = (value) =>
    setParams(
      (p) => {
        if (value) p.set('show', value)
        else p.delete('show')
        return p
      },
      { replace: true },
    )

  return (
    <Page width="narrow">
      <PageHeader
        title="Notifications"
        subtitle="Class bookings, new lessons and study tips, all in one place."
        badge={unreadCount > 0 && <Badge className="h-auto px-2.5 py-0.5 text-xs">{unreadCount} unread</Badge>}
        actions={
          <Button variant="outline" onClick={markAll} disabled={!unreadCount || markingAll}>
            <CheckCheck aria-hidden="true" /> <span className="max-xs:sr-only">Mark all as read</span>
          </Button>
        }
      />

      <div className="mb-6">
        <ChipGroup label="Show" value={onlyUnread ? 'unread' : ''} onChange={setShow} options={[{ value: 'unread', label: 'Unread' }]} />
      </div>

      {loading && !data ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading notifications">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[84px] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : shown.length === 0 ? (
        <MascotMessage
          pose="sleepy"
          title="You’re all caught up!"
          text={onlyUnread ? 'No unread notifications. Time for a little study session?' : 'New lessons, bookings and tips will show up here.'}
          action={
            onlyUnread && items.length > 0 ? (
              <Button variant="outline" onClick={() => setShow('')}>
                Show all notifications
              </Button>
            ) : (
              <Button asChild>
                <Link to="/dashboard">Back to dashboard</Link>
              </Button>
            )
          }
        />
      ) : (
        <motion.div className="flex flex-col gap-7" variants={stagger(0.05)} {...entrance}>
          {GROUPS.map((group) => {
            const list = shown.filter((n) => groupOf(n.createdAt) === group)
            if (!list.length) return null
            return (
              <section key={group} aria-labelledby={`group-${group}`}>
                <motion.h2
                  variants={fadeUp}
                  id={`group-${group}`}
                  className="mb-2 px-1 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase"
                >
                  {group}
                </motion.h2>
                <ul className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {list.map((n) => (
                      <motion.li
                        key={n.id}
                        variants={fadeUp}
                        layout={!reduce}
                        exit={reduce ? undefined : { opacity: 0, x: 24, transition: { duration: 0.2 } }}
                      >
                        <NotificationItem n={n} onOpen={open} />
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </section>
            )
          })}
        </motion.div>
      )}
    </Page>
  )
}

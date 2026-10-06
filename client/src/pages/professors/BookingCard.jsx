// Booking: pick a day (next 7 days) → a free time → session length (live price) → confirm dialog.
// The API sends start times as ISO date-times (Tunis time); they are shown in the student's local time.
// The free times depend on the session length (a longer class must not overlap another booking).
// Native radio inputs under the hood, so keyboard (arrows, Tab) and screen readers just work.

import { useState } from 'react'
import { CalendarDays, Clock, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { formatTND } from '@/lib/money'
import { fullName } from '@/lib/people'
import { dayParts, formatDuration, formatTime, localDateKey } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { SESSION_LENGTHS, bookSlot, getAvailability } from '@/services/professors'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { useNotifications } from '../../layout/notificationsContext.js'

const LOCAL_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone
const OUTSIDE_TUNISIA = LOCAL_ZONE !== 'Africa/Tunis'

// ISO start times → the next 7 LOCAL days: [{ date: 'YYYY-MM-DD', times: [iso, …] }]
function groupByLocalDay(slots) {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i)
    const date = localDateKey(d)
    return { date, times: slots.filter((iso) => localDateKey(new Date(iso)) === date) }
  })
}

// A radio input styled as a tile. `children` is the visible label.
function Choice({ name, value, checked, disabled, onChange, className, children }) {
  return (
    <label
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-xl border border-border bg-background px-1 py-2 text-center transition-colors',
        'hover:border-primary has-checked:border-primary has-checked:bg-primary has-checked:text-primary-foreground',
        'has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
        'has-disabled:cursor-not-allowed has-disabled:opacity-45 has-disabled:hover:border-border',
        className,
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} disabled={disabled} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

function Step({ number, title, children }) {
  return (
    <fieldset className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-sm font-semibold">
        <span className="me-2 inline-grid size-5 place-items-center rounded-full bg-accent text-xs text-primary-text">{number}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export default function BookingCard({ prof, onBooked }) {
  const { t } = useTranslation()
  const { refresh: refreshUnread } = useNotifications()
  const [version, setVersion] = useState(0) // bump to reload the free times
  const [duration, setDuration] = useState(60)
  const availability = useAsync(() => getAvailability(prof.id, { durationMinutes: duration }), [prof.id, version, duration])
  const days = availability.data && groupByLocalDay(availability.data.slots)

  const [pickedDate, setPickedDate] = useState(null)
  const [time, setTime] = useState(null) // ISO start of the chosen slot
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [bookingError, setBookingError] = useState(null)

  // The picked day, unless it has no free time anymore (e.g. after a failed booking or a longer
  // session): then the first day that still has one. null = fully booked.
  const firstFree = days?.find((d) => d.times.length)?.date ?? null
  const date = days?.find((d) => d.date === pickedDate)?.times.length ? pickedDate : firstFree
  const times = days?.find((d) => d.date === date)?.times ?? []
  const selected = times.includes(time) ? time : null // a time that vanished is no longer selected
  const price = Math.round(prof.pricePerHour * (duration / 60) * 10) / 10

  const confirm = async () => {
    setSubmitting(true)
    setBookingError(null)
    try {
      const booking = await bookSlot(prof.id, { startsAt: selected, durationMinutes: duration })
      setConfirming(false)
      refreshUnread() // the booking created a notification: update the 🔔 dot
      onBooked(booking)
    } catch (err) {
      setBookingError(err.message)
      toast.error(t('booking.failed'), { description: err.message })
      setTime(null)
      setVersion((v) => v + 1) // the slot may be gone: refresh the free times
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="gap-5 p-5 lg:sticky lg:top-[calc(var(--app-header-h,67px)+24px)]" aria-labelledby="booking-title">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="booking-title" className="text-lg font-bold">
          {t('professors.book')}
        </h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatTND(prof.pricePerHour)}</span> {t('professors.perHour')}
        </p>
      </div>

      {availability.loading && !days ? (
        <div className="flex flex-col gap-3" role="status" aria-label={t('booking.loading')}>
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : availability.error ? (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-muted-foreground">{t('booking.error')}</p>
          <Button variant="outline" size="sm" onClick={availability.reload}>
            {t('common.tryAgain')}
          </Button>
        </div>
      ) : !date ? (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          {t('booking.fullyBooked', { name: prof.firstName })}
        </p>
      ) : (
        <>
          <Step number={1} title={t('booking.pickDay')}>
            <div className="grid grid-cols-7 gap-1.5">
              {days.map((d) => {
                const parts = dayParts(d.date)
                return (
                  <Choice
                    key={d.date}
                    name="booking-day"
                    value={d.date}
                    checked={d.date === date}
                    disabled={!d.times.length}
                    onChange={() => {
                      setPickedDate(d.date)
                      setTime(null)
                    }}
                    className="py-2.5"
                  >
                    <span className="text-[11px] font-semibold uppercase opacity-80" aria-hidden="true">
                      {parts.weekday}
                    </span>
                    <span className="text-lg leading-tight font-bold" aria-hidden="true">
                      {parts.day}
                    </span>
                    <span className="sr-only">
                      {parts.long}, {t('booking.freeTimes', { count: d.times.length })}
                    </span>
                  </Choice>
                )
              })}
            </div>
          </Step>

          <Step number={2} title={t('booking.chooseTime', { day: dayParts(date).long })}>
            <div className="grid grid-cols-3 gap-2">
              {times.map((iso) => (
                <Choice
                  key={iso}
                  name="booking-time"
                  value={iso}
                  checked={iso === selected}
                  onChange={() => setTime(iso)}
                  className="py-2.5 text-sm font-semibold"
                >
                  {formatTime(iso)}
                </Choice>
              ))}
            </div>
            {OUTSIDE_TUNISIA && <p className="text-xs text-muted-foreground">{t('booking.timeZone', { zone: LOCAL_ZONE })}</p>}
          </Step>

          <Step number={3} title={t('booking.length')}>
            <div className="grid grid-cols-3 gap-2">
              {SESSION_LENGTHS.map((m) => (
                <Choice key={m} name="booking-length" value={m} checked={m === duration} onChange={() => setDuration(m)} className="py-2.5 text-sm font-semibold">
                  {formatDuration(m)}
                </Choice>
              ))}
            </div>
          </Step>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-4 py-3" aria-live="polite">
            <span className="text-sm text-muted-foreground">{t('booking.totalFor', { duration: formatDuration(duration) })}</span>
            <span className="text-xl font-extrabold">{formatTND(price)}</span>
          </div>

          <Button size="lg" className="w-full" disabled={!selected}
            onClick={() => {
              setBookingError(null)
              setConfirming(true)
            }}>
            {selected ? t('booking.bookThis') : t('booking.pickTime')}
          </Button>
        </>
      )}

      <Dialog open={confirming} onOpenChange={(open) => !submitting && setConfirming(open)}>
        <DialogContent className="gap-5 p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{t('booking.confirmTitle')}</DialogTitle>
            <DialogDescription>{t('booking.confirmText')}</DialogDescription>
          </DialogHeader>

          {selected && (
            <dl className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">{t('booking.professor')}</dt>
                <dd className="text-end font-semibold">
                  {fullName(prof)} · {t(`subjects.${prof.subject}`)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays size={15} aria-hidden="true" /> {t('booking.when')}
                </dt>
                <dd className="text-end font-semibold">
                  {dayParts(localDateKey(new Date(selected))).long}, {formatTime(selected)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={15} aria-hidden="true" /> {t('booking.lengthShort')}
                </dt>
                <dd className="font-semibold">{formatDuration(duration)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet size={15} aria-hidden="true" /> {t('booking.price')}
                </dt>
                <dd className="text-base font-extrabold">{formatTND(price)}</dd>
              </div>
            </dl>
          )}
          <p className="text-xs text-muted-foreground">{t('booking.payLater')}</p>

          {bookingError && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {bookingError}
            </p>
          )}

          <DialogFooter className="-mx-6 -mb-6 gap-2 rounded-b-2xl p-4 px-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                {t('common.cancel')}
              </Button>
            </DialogClose>
            <Button onClick={confirm} disabled={submitting || !selected}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> {t('booking.booking')}
                </>
              ) : (
                t('booking.confirm')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

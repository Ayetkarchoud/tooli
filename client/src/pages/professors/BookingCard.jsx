// Booking: pick a day (next 7 days) → a free time → session length (live price) → confirm dialog.
// The API sends start times as ISO date-times (Tunis time); they are shown in the student's local time.
// The free times depend on the session length (a longer class must not overlap another booking).
// Native radio inputs under the hood, so keyboard (arrows, Tab) and screen readers just work.

import { useState } from 'react'
import { CalendarDays, Clock, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
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
        <span className="mr-2 inline-grid size-5 place-items-center rounded-full bg-accent text-xs text-primary-text">{number}</span>
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

export default function BookingCard({ prof, onBooked }) {
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
      onBooked(booking)
    } catch (err) {
      setBookingError(err.message)
      toast.error('Booking didn’t go through', { description: err.message })
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
          Book a class
        </h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{formatTND(prof.pricePerHour)}</span> / hour
        </p>
      </div>

      {availability.loading && !days ? (
        <div className="flex flex-col gap-3" role="status" aria-label="Loading free times">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
      ) : availability.error ? (
        <div role="alert" className="flex flex-col items-start gap-2 text-sm">
          <p className="text-muted-foreground">The free times didn’t load.</p>
          <Button variant="outline" size="sm" onClick={availability.reload}>
            Try again
          </Button>
        </div>
      ) : !date ? (
        <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          {prof.firstName} is fully booked for the next 7 days. New times open every week, check back soon!
        </p>
      ) : (
        <>
          <Step number={1} title="Pick a day">
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
                    <span className="text-[11px] font-semibold uppercase opacity-80">{parts.weekday}</span>
                    <span className="text-lg leading-tight font-bold">{parts.day}</span>
                    <span className="sr-only">
                      {parts.month}, {d.times.length ? `${d.times.length} free times` : 'no free time'}
                    </span>
                  </Choice>
                )
              })}
            </div>
          </Step>

          <Step number={2} title={`Choose a time · ${dayParts(date).long}`}>
            <div className="grid grid-cols-3 gap-2">
              {times.map((t) => (
                <Choice key={t} name="booking-time" value={t} checked={t === selected} onChange={() => setTime(t)} className="py-2.5 text-sm font-semibold">
                  {formatTime(t)}
                </Choice>
              ))}
            </div>
            {OUTSIDE_TUNISIA && <p className="text-xs text-muted-foreground">Times are shown in your time zone ({LOCAL_ZONE}).</p>}
          </Step>

          <Step number={3} title="Session length">
            <div className="grid grid-cols-3 gap-2">
              {SESSION_LENGTHS.map((m) => (
                <Choice key={m} name="booking-length" value={m} checked={m === duration} onChange={() => setDuration(m)} className="py-2.5 text-sm font-semibold">
                  {formatDuration(m)}
                </Choice>
              ))}
            </div>
          </Step>

          <div className="flex items-center justify-between gap-3 rounded-xl bg-muted/70 px-4 py-3" aria-live="polite">
            <span className="text-sm text-muted-foreground">Total for {formatDuration(duration)}</span>
            <span className="text-xl font-extrabold">{formatTND(price)}</span>
          </div>

          <Button size="lg" className="w-full" disabled={!selected}
            onClick={() => {
              setBookingError(null)
              setConfirming(true)
            }}>
            {selected ? 'Book this class' : 'Pick a time to continue'}
          </Button>
        </>
      )}

      <Dialog open={confirming} onOpenChange={(open) => !submitting && setConfirming(open)}>
        <DialogContent className="gap-5 p-6 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Confirm your class</DialogTitle>
            <DialogDescription>Check the details, then confirm. You can cancel up to 24 h before the class.</DialogDescription>
          </DialogHeader>

          {selected && (
            <dl className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Professor</dt>
                <dd className="text-right font-semibold">
                  {fullName(prof)} · {prof.subject}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays size={15} aria-hidden="true" /> When
                </dt>
                <dd className="text-right font-semibold">
                  {dayParts(localDateKey(new Date(selected))).long}, {formatTime(selected)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={15} aria-hidden="true" /> Length
                </dt>
                <dd className="font-semibold">{formatDuration(duration)}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt className="flex items-center gap-1.5 text-muted-foreground">
                  <Wallet size={15} aria-hidden="true" /> Price
                </dt>
                <dd className="text-base font-extrabold">{formatTND(price)}</dd>
              </div>
            </dl>
          )}
          <p className="text-xs text-muted-foreground">You pay the professor after the class. Online payment is coming soon.</p>

          {bookingError && (
            <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm font-semibold text-destructive">
              {bookingError}
            </p>
          )}

          <DialogFooter className="-mx-6 -mb-6 gap-2 rounded-b-2xl p-4 px-6">
            <DialogClose asChild>
              <Button variant="outline" disabled={submitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={confirm} disabled={submitting || !selected}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> Booking…
                </>
              ) : (
                'Confirm booking'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

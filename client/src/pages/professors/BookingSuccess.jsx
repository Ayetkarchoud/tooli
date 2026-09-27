// Shown after a booking: the mascot celebrates, a little confetti, what's next.

import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarPlus, CalendarDays, Clock, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { formatTND } from '@/lib/money'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { fullName } from '@/lib/people'
import { dayParts, formatDuration } from '@/lib/time'
import { Button } from '@/components/ui/button'
import Confetti from '../../components/Confetti.jsx'
import Mascot from '../../components/Mascot.jsx'

export default function BookingSuccess({ booking, prof, onBookAnother }) {
  const entrance = useEntrance()
  const titleRef = useRef(null)
  const when = dayParts(booking.date).long

  // Move focus to the title so screen readers announce the success
  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  return (
    <motion.div
      className="mx-auto flex max-w-lg flex-col items-center rounded-3xl border border-border bg-card px-6 py-10 text-center"
      variants={stagger(0.08)}
      {...entrance}
    >
      <motion.div variants={fadeUp} className="relative grid place-items-center">
        <span
          className="absolute size-44 rounded-full [background:radial-gradient(circle_at_30%_30%,var(--color-accent-soft),transparent_60%),var(--color-primary-soft)]"
          aria-hidden="true"
        />
        <Confetti />
        <Mascot pose="celebrating" size={150} title="" aria-hidden="true" className="relative" />
      </motion.div>

      <motion.h1
        ref={titleRef}
        tabIndex={-1}
        variants={fadeUp}
        className="mt-6 text-[clamp(24px,4vw,30px)] leading-tight font-extrabold outline-none"
      >
        Your class is booked!
      </motion.h1>
      <motion.p variants={fadeUp} className="mt-2 text-muted-foreground">
        {fullName(prof)} is looking forward to seeing you. We added a reminder to your notifications.
      </motion.p>

      <motion.dl variants={fadeUp} className="mt-6 grid w-full gap-3 rounded-2xl bg-muted/70 p-4 text-left text-sm sm:grid-cols-[1.7fr_1fr_1fr]">
        <div className="flex items-center gap-2.5">
          <CalendarDays size={18} className="shrink-0 text-primary-text" aria-hidden="true" />
          <div>
            <dt className="text-xs text-muted-foreground">When</dt>
            <dd className="font-semibold">
              {when}, {booking.time}
            </dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock size={18} className="shrink-0 text-primary-text" aria-hidden="true" />
          <div>
            <dt className="text-xs text-muted-foreground">Length</dt>
            <dd className="font-semibold">{formatDuration(booking.durationMinutes)}</dd>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Wallet size={18} className="shrink-0 text-primary-text" aria-hidden="true" />
          <div>
            <dt className="text-xs text-muted-foreground">Price</dt>
            <dd className="font-semibold">{formatTND(booking.price)}</dd>
          </div>
        </div>
      </motion.dl>

      <motion.div variants={fadeUp} className="mt-7 flex w-full flex-wrap justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => toast('Calendar invites are coming soon', { description: 'We’ll remind you in your notifications the day before.' })}
        >
          <CalendarPlus aria-hidden="true" /> Add to calendar
        </Button>
        <Button asChild>
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </motion.div>
      <motion.div variants={fadeUp}>
        <Button variant="link" className="mt-2" onClick={onBookAnother}>
          Book another class with {prof.firstName}
        </Button>
      </motion.div>
    </motion.div>
  )
}

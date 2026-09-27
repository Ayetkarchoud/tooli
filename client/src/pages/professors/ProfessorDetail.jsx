// One professor: profile, reviews, ask the tutor, and the booking card (sticky on desktop).
// After booking, the page shows the success screen.

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ChevronRight, Crown, GraduationCap, Languages, MapPin, MessagesSquare, RefreshCw, Star } from 'lucide-react'
import { formatTND } from '@/lib/money'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { fullName } from '@/lib/people'
import { timeAgo } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { getProfessor, getProfessorReviews } from '@/services/professors'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import LoadState from '../../components/LoadState.jsx'
import Page from '../../components/Page.jsx'
import ProfAvatar from '../../components/ProfAvatar.jsx'
import BookingCard from './BookingCard.jsx'
import BookingSuccess from './BookingSuccess.jsx'

function Stars({ value, size = 14 }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`} role="img">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} className={n <= value ? 'text-highlight' : 'text-border'} fill="currentColor" aria-hidden="true" />
      ))}
    </span>
  )
}

function ProfileHeader({ prof }) {
  return (
    <motion.section variants={fadeUp}>
      <Card className="gap-5 p-6 md:p-7">
        <div className="flex flex-wrap items-start gap-5">
          <ProfAvatar person={prof} size={92} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[clamp(22px,3vw,30px)] leading-tight font-extrabold">{fullName(prof)}</h1>
              <Badge variant="highlight" className="gap-1 text-xs">
                <Crown aria-hidden="true" /> VIP
              </Badge>
            </div>
            <p className="mt-0.5 font-semibold text-primary-text">{prof.subject}</p>
            <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
              <Star size={16} className="text-highlight" fill="currentColor" aria-hidden="true" />
              <strong>{prof.rating.toFixed(1)}</strong>
              <span className="text-muted-foreground">({prof.reviews} reviews)</span>
              <span className="text-border" aria-hidden="true">
                •
              </span>
              <strong>{formatTND(prof.pricePerHour)}</strong>
              <span className="text-muted-foreground">/ hour</span>
            </p>
          </div>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground" aria-label="Details">
          <li className="flex items-center gap-2">
            <MapPin size={16} aria-hidden="true" /> {prof.city}
          </li>
          <li className="flex items-center gap-2">
            <Languages size={16} aria-hidden="true" /> {prof.languages.join(', ')}
          </li>
          <li className="flex items-center gap-2">
            <GraduationCap size={16} aria-hidden="true" /> {prof.levels.join(', ')}
          </li>
        </ul>

        <div>
          <h2 className="mb-1.5 font-semibold">About</h2>
          <p className="leading-relaxed text-muted-foreground">{prof.bio}</p>
        </div>

        <Button asChild variant="outline" className="self-start max-xs:w-full">
          <Link
            to={`/dashboard/tutor?q=${encodeURIComponent(
              `I have a ${prof.subject} class with ${fullName(prof)} soon. Can you help me prepare?`,
            )}`}
          >
            <MessagesSquare aria-hidden="true" /> Ask tooli about {prof.subject}
          </Link>
        </Button>
      </Card>
    </motion.section>
  )
}

function Reviews({ prof }) {
  const { data: reviews, error, loading, reload } = useAsync(() => getProfessorReviews(prof.id), [prof.id])

  return (
    <motion.section variants={fadeUp} aria-labelledby="reviews-title">
      <Card className="gap-4 p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="reviews-title" className="text-lg font-bold">
            What students say
          </h2>
          <p className="flex items-center gap-2 text-sm">
            <Stars value={Math.round(prof.rating)} />
            <span className="font-semibold">{prof.rating.toFixed(1)}</span>
            <span className="text-muted-foreground">· {prof.reviews} reviews</span>
          </p>
        </div>

        {loading && !reviews ? (
          <div className="flex flex-col gap-3" role="status" aria-label="Loading reviews">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : error ? (
          <div role="alert" className="flex items-center gap-3 text-sm text-muted-foreground">
            Reviews didn’t load.
            <Button variant="pill" size="sm" onClick={reload}>
              <RefreshCw aria-hidden="true" /> Try again
            </Button>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {reviews.map((r) => (
              <li key={r.id} className="flex gap-3.5 py-4 first:pt-0 last:pb-0">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-sm font-bold" aria-hidden="true">
                  {r.author[0]}
                </span>
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-semibold">{r.author}</span>
                    <Stars value={r.rating} size={13} />
                    <time dateTime={r.createdAt} className="text-xs text-muted-foreground">
                      {timeAgo(r.createdAt)}
                    </time>
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </motion.section>
  )
}

function ProfessorView({ prof }) {
  const entrance = useEntrance()
  const [booking, setBooking] = useState(null)

  if (booking) {
    return (
      <Page>
        <BookingSuccess booking={booking} prof={prof} onBookAnother={() => setBooking(null)} />
      </Page>
    )
  }

  return (
    <Page className="max-w-[1200px]">
      <nav aria-label="Breadcrumb" className="mb-5 text-sm">
        <ol className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
          <li>
            <Link to="/dashboard/professors" className="font-semibold text-primary-text no-underline hover:underline">
              Professors
            </Link>
          </li>
          <li aria-hidden="true">
            <ChevronRight size={14} />
          </li>
          <li className="min-w-0 truncate" aria-current="page">
            {fullName(prof)}
          </li>
        </ol>
      </nav>

      {/* Phones: header → booking → reviews. Desktop: booking is a sticky right column spanning both rows */}
      <motion.div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]" variants={stagger(0.08)} {...entrance}>
        <div className="min-w-0 lg:col-start-1">
          <ProfileHeader prof={prof} />
        </div>
        <motion.div variants={fadeUp} className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <BookingCard
            prof={prof}
            onBooked={(b) => {
              setBooking(b)
              window.scrollTo({ top: 0 })
            }}
          />
        </motion.div>
        <div className="min-w-0 lg:col-start-1">
          <Reviews prof={prof} />
        </div>
      </motion.div>
    </Page>
  )
}

export default function ProfessorDetail() {
  const { profId } = useParams()
  const result = useAsync(() => getProfessor(profId), [profId])

  return (
    <LoadState
      result={result}
      notFound={{
        title: 'Professor not found',
        text: 'This profile may have moved, or the link has a typo.',
        backTo: '/dashboard/professors',
        backLabel: 'See all professors',
      }}
    >
      {(prof) => <ProfessorView prof={prof} />}
    </LoadState>
  )
}

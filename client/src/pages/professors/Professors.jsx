// VIP professors list: filters in the URL (subject, city, language, price, available this week) + cards.

import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarCheck, CalendarX, Languages, MapPin, RefreshCw, Star, X } from 'lucide-react'
import { fullName } from '@/lib/people'
import { formatTND } from '@/lib/money'
import { fadeUp, hoverLift, stagger, useEntrance } from '@/lib/motion'
import { formatSlotStart } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getProfessorFilters, listProfessors } from '@/services/professors'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import ChipGroup from '../../components/ChipGroup.jsx'
import MascotMessage, { ErrorState } from '../../components/MascotMessage.jsx'
import Page from '../../components/Page.jsx'
import { CardGridSkeleton } from '../../components/PageLoader.jsx'
import ProfAvatar from '../../components/ProfAvatar.jsx'
import PageHeader from '../../components/PageHeader.jsx'

const MotionLi = motion.li

const PRICES = [
  { value: 'under-40', label: 'Under 40 TND' },
  { value: '40-50', label: '40–50 TND' },
  { value: 'over-50', label: 'Over 50 TND' },
]
const FILTER_KEYS = ['subject', 'city', 'language', 'price', 'available']

function ProfessorCard({ prof }) {
  const path = `/dashboard/professors/${prof.id}`

  return (
    <MotionLi
      variants={fadeUp}
      {...hoverLift}
      className="group relative flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow] hover:border-primary hover:shadow-lift"
    >
      <div className="flex items-start gap-4">
        <ProfAvatar person={prof} size={60} />
        <div className="min-w-0">
          <h3 className="text-base leading-snug font-semibold">
            {/* stretched link: the whole card opens the profile */}
            <Link to={path} className="text-foreground no-underline after:absolute after:inset-0 after:rounded-2xl">
              {fullName(prof)}
            </Link>
          </h3>
          <p className="text-sm font-semibold text-primary-text">{prof.subject}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm">
            <Star size={15} className="text-highlight" fill="currentColor" aria-hidden="true" />
            <strong>{prof.rating.toFixed(1)}</strong>
            <span className="text-muted-foreground">({prof.reviews} reviews)</span>
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin size={15} aria-hidden="true" /> {prof.city}
        </li>
        <li className="flex items-center gap-2">
          <Languages size={15} aria-hidden="true" /> {prof.languages.join(', ')}
        </li>
        <li className={cn('flex items-center gap-2', prof.nextSlot && 'font-semibold text-foreground')}>
          {prof.nextSlot ? (
            <>
              <CalendarCheck size={15} className="text-primary-text" aria-hidden="true" />
              Next: {formatSlotStart(prof.nextSlot)}
            </>
          ) : (
            <>
              <CalendarX size={15} aria-hidden="true" /> Fully booked this week
            </>
          )}
        </li>
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <p>
          <span className="text-lg font-bold">{formatTND(prof.pricePerHour)}</span>
          <span className="text-sm text-muted-foreground"> / hour</span>
        </p>
        <Button asChild size="sm" className="relative z-10">
          <Link to={path} aria-label={`View ${fullName(prof)}’s profile`}>
            View profile
          </Link>
        </Button>
      </div>
    </MotionLi>
  )
}

export default function Professors() {
  const [params, setParams] = useSearchParams()
  const subject = params.get('subject') ?? ''
  const city = params.get('city') ?? ''
  const language = params.get('language') ?? ''
  const price = PRICES.some((p) => p.value === params.get('price')) ? params.get('price') : ''
  const available = params.get('available') === '1'

  const result = useAsync(
    () => listProfessors({ subject, city, language, price, available }),
    [subject, city, language, price, available],
  )
  const options = useAsync(getProfessorFilters, [])
  const entrance = useEntrance()

  const setParam = useCallback(
    (key, value) =>
      setParams(
        (p) => {
          if (value) p.set(key, value)
          else p.delete(key)
          return p
        },
        { replace: true },
      ),
    [setParams],
  )
  const hasFilters = FILTER_KEYS.some((k) => params.get(k))
  const resetFilters = () =>
    setParams(
      (p) => {
        FILTER_KEYS.forEach((k) => p.delete(k))
        return p
      },
      { replace: true },
    )

  const profs = result.data

  return (
    <Page>
      <PageHeader
        title="Learn with the best professors in Tunisia"
        subtitle="Private classes with hand-picked, top-rated professors. Pick a time that suits you and book in a few clicks."
        mascot="waving"
      />

      <section aria-labelledby="prof-filters-title" className="mb-6 flex flex-col gap-3">
        <h2 id="prof-filters-title" className="sr-only">
          Filters
        </h2>
        {options.data ? (
          <>
            <ChipGroup
              label="Subject"
              value={subject}
              onChange={(v) => setParam('subject', v)}
              options={options.data.subjects.map((s) => ({ value: s, label: s }))}
            />
            <ChipGroup label="City" value={city} onChange={(v) => setParam('city', v)} options={options.data.cities.map((c) => ({ value: c, label: c }))} />
            <ChipGroup
              label="Language"
              value={language}
              onChange={(v) => setParam('language', v)}
              options={options.data.languages.map((l) => ({ value: l, label: l }))}
            />
            <ChipGroup label="Price" value={price} onChange={(v) => setParam('price', v)} options={PRICES} />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full max-w-2xl rounded-full" />)
        )}

        <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full border border-border bg-card py-1.5 pr-4 pl-1.5 text-sm font-semibold has-checked:border-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
          <input
            type="checkbox"
            role="switch"
            className="peer sr-only"
            checked={available}
            onChange={(e) => setParam('available', e.target.checked ? '1' : '')}
          />
          {/* a small switch drawn with tokens */}
          <span
            aria-hidden="true"
            className="relative h-6 w-10 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:top-1 after:left-1 after:size-4 after:rounded-full after:bg-card after:shadow-sm after:transition-transform peer-checked:after:translate-x-4"
          />
          Available this week
        </label>
      </section>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {profs && !result.loading && `${profs.length} ${profs.length === 1 ? 'professor' : 'professors'}`}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X aria-hidden="true" /> Reset filters
          </Button>
        )}
      </div>

      {result.loading && !profs ? (
        <CardGridSkeleton count={6} className="h-[300px]" />
      ) : result.error ? (
        <ErrorState onRetry={result.reload} />
      ) : profs.length === 0 ? (
        <MascotMessage
          pose="sleepy"
          title="No professor matches these filters"
          text="Try another city or language, or turn off “Available this week”."
          action={
            <Button onClick={resetFilters}>
              <RefreshCw aria-hidden="true" /> Reset filters
            </Button>
          }
        />
      ) : (
        <motion.ul
          key={profs.map((p) => p.id).join()} // replay the stagger when the results change
          className={cn('grid grid-cols-[repeat(auto-fill,minmax(270px,1fr))] gap-4 transition-opacity', result.loading && 'opacity-60')}
          variants={stagger(0.06)}
          {...entrance}
          aria-busy={result.loading}
        >
          {profs.map((p) => (
            <ProfessorCard key={p.id} prof={p} />
          ))}
        </motion.ul>
      )}
    </Page>
  )
}

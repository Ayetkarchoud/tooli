// VIP professors list: filters in the URL (subject, city, language, price, available this week) + cards.

import { useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { CalendarCheck, CalendarX, Languages, MapPin, RefreshCw, Star, X } from 'lucide-react'
import { fullName } from '@/lib/people'
import { formatTND } from '@/lib/money'
import { useTranslation } from 'react-i18next'
import { formatRating } from '@/lib/numbers'
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

// Price ranges (labels: professors.prices.<value>, with the amounts formatted per language)
const PRICES = ['under-40', '40-50', 'over-50']
const FILTER_KEYS = ['subject', 'city', 'language', 'price', 'available']

function ProfessorCard({ prof }) {
  const { t } = useTranslation()
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
          <p className="text-sm font-semibold text-primary-text">{t(`subjects.${prof.subject}`)}</p>
          <p className="mt-1 flex items-center gap-1.5 text-sm">
            <Star size={15} className="text-highlight" fill="currentColor" aria-hidden="true" />
            <strong>{formatRating(prof.rating)}</strong>
            <span className="text-muted-foreground">({t('professors.reviewCount', { count: prof.reviews })})</span>
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <MapPin size={15} aria-hidden="true" /> {t(`cities.${prof.city}`)}
        </li>
        <li className="flex items-center gap-2">
          <Languages size={15} aria-hidden="true" /> {prof.languages.map((l) => t(`languageNames.${l}`)).join(t('common.listSeparator'))}
        </li>
        <li className={cn('flex items-center gap-2', prof.nextSlot && 'font-semibold text-foreground')}>
          {prof.nextSlot ? (
            <>
              <CalendarCheck size={15} className="text-primary-text" aria-hidden="true" />
              {t('professors.next', { when: formatSlotStart(prof.nextSlot) })}
            </>
          ) : (
            <>
              <CalendarX size={15} aria-hidden="true" /> {t('professors.fullyBooked')}
            </>
          )}
        </li>
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <p>
          <span className="text-lg font-bold">{formatTND(prof.pricePerHour)}</span>
          <span className="text-sm text-muted-foreground"> {t('professors.perHour')}</span>
        </p>
        <Button asChild size="sm" className="relative z-10">
          <Link to={path} aria-label={t('professors.viewProfileOf', { name: fullName(prof) })}>
            {t('professors.viewProfile')}
          </Link>
        </Button>
      </div>
    </MotionLi>
  )
}

export default function Professors() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const subject = params.get('subject') ?? ''
  const city = params.get('city') ?? ''
  const language = params.get('language') ?? ''
  const price = PRICES.includes(params.get('price')) ? params.get('price') : ''
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
        title={t('professors.title')}
        subtitle={t('professors.subtitle')}
        mascot="waving"
      />

      <section aria-labelledby="prof-filters-title" className="mb-6 flex flex-col gap-3">
        <h2 id="prof-filters-title" className="sr-only">
          {t('filters.title')}
        </h2>
        {options.data ? (
          <>
            <ChipGroup
              label={t('filters.subject')}
              value={subject}
              onChange={(v) => setParam('subject', v)}
              options={options.data.subjects.map((s) => ({ value: s, label: t(`subjects.${s}`) }))}
            />
            <ChipGroup
              label={t('filters.city')}
              value={city}
              onChange={(v) => setParam('city', v)}
              options={options.data.cities.map((c) => ({ value: c, label: t(`cities.${c}`) }))}
            />
            <ChipGroup
              label={t('filters.language')}
              value={language}
              onChange={(v) => setParam('language', v)}
              options={options.data.languages.map((l) => ({ value: l, label: t(`languageNames.${l}`) }))}
            />
            <ChipGroup
              label={t('filters.price')}
              value={price}
              onChange={(v) => setParam('price', v)}
              options={PRICES.map((p) => ({
                value: p,
                label: t(`professors.prices.${p}`, { low: formatTND(40), high: formatTND(50) }),
              }))}
            />
          </>
        ) : (
          [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full max-w-2xl rounded-full" />)
        )}

        <label className="flex w-fit cursor-pointer items-center gap-3 rounded-full border border-border bg-card py-1.5 ps-1.5 pe-4 text-sm font-semibold has-checked:border-primary has-focus-visible:ring-3 has-focus-visible:ring-ring/50">
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
            className="relative h-6 w-10 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:start-1 after:top-1 after:size-4 after:rounded-full after:bg-card after:shadow-sm after:transition-transform peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4"
          />
          {t('professors.availableWeek')}
        </label>
      </section>

      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {profs && !result.loading && t('professors.count', { count: profs.length })}
        </p>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X aria-hidden="true" /> {t('filters.reset')}
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
          title={t('professors.empty.title')}
          text={t('professors.empty.text')}
          action={
            <Button onClick={resetFilters}>
              <RefreshCw aria-hidden="true" /> {t('filters.reset')}
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

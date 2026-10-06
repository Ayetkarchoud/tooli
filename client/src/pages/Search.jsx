// Search across courses, professors and tips. ?q= is shared with the top-bar search.

import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Lightbulb, MessagesSquare, Search as SearchIcon, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import Highlight from '@/lib/highlight'
import { formatRating } from '@/lib/numbers'
import { formatTND } from '@/lib/money'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { fullName } from '@/lib/people'
import { useAsync } from '@/lib/useAsync'
import { getCourseFilters } from '@/services/courses'
import { search } from '@/services/search'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import MascotMessage, { ErrorState } from '../components/MascotMessage.jsx'
import Page from '../components/Page.jsx'
import { CardGridSkeleton } from '../components/PageLoader.jsx'
import ProfAvatar from '../components/ProfAvatar.jsx'
import CourseCard from './courses/CourseCard.jsx'
import PageHeader from '../components/PageHeader.jsx'

// Big search box: types freely, writes ?q= after a short pause; follows the URL when it changes elsewhere
function SearchBox({ value, onSearch }) {
  const { t } = useTranslation()
  const [text, setText] = useState(value)
  const [shown, setShown] = useState(value)
  if (value !== shown) {
    setShown(value)
    setText(value)
  }

  useEffect(() => {
    if (text.trim() === value) return
    const timer = setTimeout(() => onSearch(text.trim()), 300)
    return () => clearTimeout(timer)
  }, [text, value, onSearch])

  return (
    <form
      role="search"
      className="relative"
      onSubmit={(e) => {
        e.preventDefault()
        onSearch(text.trim())
      }}
    >
      <SearchIcon size={22} className="pointer-events-none absolute start-4 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('search.bigPlaceholder')}
        aria-label={t('search.label')}
        autoFocus={!value}
        className="h-14 rounded-2xl bg-card ps-12 text-lg shadow-[0_8px_24px_-18px_color-mix(in_srgb,var(--color-text)_40%,transparent)] focus-visible:border-primary focus-visible:ring-accent md:text-lg dark:bg-card"
      />
    </form>
  )
}

// subjects = ids; picking one searches its name in the current language
function SubjectChips({ subjects, onPick, label }) {
  const { t } = useTranslation()
  if (!subjects?.length) return null
  return (
    <div className="flex flex-col items-center gap-2.5">
      <p className="text-sm font-semibold text-muted-foreground">{label ?? t('search.popular')}</p>
      <ul className="flex flex-wrap justify-center gap-2">
        {subjects.map((s) => (
          <li key={s}>
            <Button type="button" variant="pill" size="sm" className="bg-card" onClick={() => onPick(t(`subjects.${s}`))}>
              {t(`subjects.${s}`)}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function SectionTitle({ id, children, count }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-2 text-lg font-bold">
      {children}
      <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-foreground">{count}</span>
    </h2>
  )
}

function ProfessorResult({ prof, query }) {
  const { t } = useTranslation()
  return (
    <motion.li variants={fadeUp}>
      <Link
        to={`/dashboard/professors/${prof.id}`}
        className="group flex items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-foreground no-underline transition-colors hover:border-primary"
      >
        <ProfAvatar person={prof} size={46} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold">
            <Highlight text={fullName(prof)} query={query} />
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            <Highlight text={`${t(`subjects.${prof.subject}`)} · ${t(`cities.${prof.city}`)}`} query={query} />
          </span>
        </span>
        <span className="hidden shrink-0 text-end text-sm sm:block">
          <span className="flex items-center justify-end gap-1 font-semibold">
            <Star size={14} className="text-highlight" fill="currentColor" aria-hidden="true" /> {formatRating(prof.rating)}
          </span>
          <span className="text-muted-foreground">
            {formatTND(prof.pricePerHour)} {t('professors.perHourShort')}
          </span>
        </span>
        <ArrowRight size={18} className="shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden="true" />
      </Link>
    </motion.li>
  )
}

export default function Search() {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams()
  const q = (params.get('q') ?? '').trim()
  const result = useAsync(() => (q ? search(q) : Promise.resolve(null)), [q])
  const filters = useAsync(getCourseFilters, [])
  const entrance = useEntrance()

  const setQuery = useCallback(
    (text) =>
      setParams(
        (p) => {
          if (text) p.set('q', text)
          else p.delete('q')
          return p
        },
        { replace: true },
      ),
    [setParams],
  )

  const data = result.data
  const total = data ? data.courses.length + data.professors.length + data.tips.length : 0
  const subjects = filters.data?.subjects

  let body
  if (!q) {
    body = (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <p className="max-w-md text-muted-foreground">{t('search.intro')}</p>
        <SubjectChips subjects={subjects} onPick={setQuery} />
      </div>
    )
  } else if (result.loading && !data) {
    body = (
      <div className="flex flex-col gap-8" role="status" aria-label={t('search.searching')}>
        <Skeleton className="h-6 w-40" />
        <CardGridSkeleton count={3} className="h-[280px]" />
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-20 rounded-2xl" />
      </div>
    )
  } else if (result.error) {
    body = <ErrorState onRetry={result.reload} />
  } else if (total === 0) {
    body = (
      <MascotMessage
        pose="thinking"
        title={t('search.noMatch', { query: q })}
        text={t('search.noMatchText')}
        action={
          <div className="flex flex-col items-center gap-6">
            <Button asChild size="lg">
              <Link to={`/dashboard/tutor?q=${encodeURIComponent(q)}`}>
                <MessagesSquare aria-hidden="true" /> {t('courses.askTutor')}
              </Link>
            </Button>
            <SubjectChips subjects={subjects} onPick={setQuery} label={t('search.trySubject')} />
          </div>
        }
      />
    )
  } else {
    body = (
      <motion.div
        key={q} // replay the entrance for each new search
        className="flex flex-col gap-10"
        variants={stagger(0.06)}
        {...entrance}
        aria-busy={result.loading}
      >
        {data.courses.length > 0 && (
          <section aria-labelledby="results-courses">
            <SectionTitle id="results-courses" count={data.courses.length}>
              {t('nav.coursesShort')}
            </SectionTitle>
            <motion.ul className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4" variants={stagger(0.05)}>
              {data.courses.map((c) => (
                <CourseCard key={c.id} course={c} query={q} />
              ))}
            </motion.ul>
          </section>
        )}

        {data.professors.length > 0 && (
          <section aria-labelledby="results-professors">
            <SectionTitle id="results-professors" count={data.professors.length}>
              {t('search.professors')}
            </SectionTitle>
            <motion.ul className="grid gap-3 md:grid-cols-2" variants={stagger(0.05)}>
              {data.professors.map((p) => (
                <ProfessorResult key={p.id} prof={p} query={q} />
              ))}
            </motion.ul>
          </section>
        )}

        {data.tips.length > 0 && (
          <section aria-labelledby="results-tips">
            <SectionTitle id="results-tips" count={data.tips.length}>
              {t('search.tips')}
            </SectionTitle>
            <motion.ul className="flex flex-col gap-3" variants={stagger(0.05)}>
              {data.tips.map((tip) => (
                <motion.li key={tip.id} variants={fadeUp} className="flex gap-3.5 rounded-2xl border border-border bg-card p-4">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-highlight-soft" aria-hidden="true">
                    <Lightbulb size={18} />
                  </span>
                  <p className="leading-relaxed">
                    <Highlight text={tip.text} query={q} />
                  </p>
                </motion.li>
              ))}
            </motion.ul>
          </section>
        )}
      </motion.div>
    )
  }

  return (
    <Page>
      <PageHeader title={t('search.title')} subtitle={t('search.subtitle')} className="mb-5" />
      <SearchBox value={q} onSearch={setQuery} />
      <p className="mt-3 mb-8 min-h-5 text-sm text-muted-foreground" aria-live="polite">
        {q && data && !result.loading && t('search.resultCount', { count: total, query: q })}
      </p>
      {body}
    </Page>
  )
}

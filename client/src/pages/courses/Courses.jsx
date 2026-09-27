// Course catalogue: continue learning, search, filters (in the URL, so links can be shared), sort, grid.

import { useCallback, useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, ArrowUpDown, RefreshCw, Search, X } from 'lucide-react'
import { stagger, useEntrance } from '@/lib/motion'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getContinueLearning, getCourseFilters, listCourses } from '@/services/courses'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Mascot from '../../components/Mascot.jsx'
import MascotMessage, { ErrorState } from '../../components/MascotMessage.jsx'
import Page from '../../components/Page.jsx'
import { CardGridSkeleton } from '../../components/PageLoader.jsx'
import ProgressRing from '../../components/ProgressRing.jsx'
import CourseCard from './CourseCard.jsx'

const SORTS = [
  { id: 'popular', label: 'Most popular' },
  { id: 'newest', label: 'Newest' },
  { id: 'shortest', label: 'Shortest' },
]
const FILTER_KEYS = ['q', 'subject', 'level', 'platform']

// ---------- Continue learning (horizontal scroll) ----------
function ContinueRow() {
  const { data: courses, error, loading, reload } = useAsync(getContinueLearning, [])

  if (!loading && !error && courses.length === 0) return null

  return (
    <section aria-labelledby="continue-title" className="mb-8">
      <h2 id="continue-title" className="mb-3 text-lg font-semibold">
        Continue learning
      </h2>
      {error ? (
        <p className="flex items-center gap-3 text-sm text-muted-foreground" role="alert">
          Your courses in progress didn’t load.
          <Button variant="pill" size="sm" onClick={reload}>
            <RefreshCw aria-hidden="true" /> Try again
          </Button>
        </p>
      ) : (
        <ul className="-mx-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-6 pb-2 max-[560px]:-mx-4 max-[560px]:px-4">
          {loading
            ? [0, 1, 2].map((i) => (
                <li key={i} className="shrink-0">
                  <Skeleton className="h-[92px] w-[290px] rounded-2xl" />
                </li>
              ))
            : courses.map((c) => (
                <li key={c.id} className="w-[290px] shrink-0 snap-start">
                  <Link
                    to={`/dashboard/courses/${c.id}`}
                    className="group flex h-full items-center gap-3.5 rounded-2xl border border-border bg-card p-3.5 text-foreground no-underline transition-[border-color,box-shadow] hover:border-primary hover:shadow-lift"
                  >
                    <ProgressRing value={c.progress} size={58} label={`${c.title}: ${c.progress}% done`} />
                    <span className="min-w-0">
                      <span className="block text-xs font-semibold text-muted-foreground">{c.platform.name}</span>
                      <span className="line-clamp-2 text-sm leading-snug font-semibold">{c.title}</span>
                      <span className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary-text">
                        Resume <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
        </ul>
      )}
    </section>
  )
}

// ---------- Search box (writes ?q= after a short pause) ----------
function SearchBox({ value, onSearch }) {
  const [text, setText] = useState(value)
  // The URL changed from elsewhere (reset, back button): show it
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
    <div className="relative min-w-0 flex-1">
      <Search size={18} className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Search a course, a subject, a platform…"
        aria-label="Search courses"
        className="h-11 rounded-xl bg-card pl-10 text-sm md:text-sm dark:bg-card"
      />
    </div>
  )
}

// ---------- One row of filter chips ----------
function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-3 max-md:flex-col max-md:items-start max-md:gap-1.5">
      <span className="w-20 shrink-0 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase" id={`chips-${label}`}>
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={`chips-${label}`}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        {[{ value: '', label: 'All' }, ...options].map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary hover:bg-accent',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function Courses() {
  const [params, setParams] = useSearchParams()
  const filters = {
    q: params.get('q') ?? '',
    subject: params.get('subject') ?? '',
    level: params.get('level') ?? '',
    platform: params.get('platform') ?? '',
    sort: SORTS.some((s) => s.id === params.get('sort')) ? params.get('sort') : 'popular',
  }
  const { q, subject, level, platform, sort } = filters

  const result = useAsync(() => listCourses(filters), [q, subject, level, platform, sort])
  const options = useAsync(getCourseFilters, [])
  const entrance = useEntrance()

  // setParams must be the current one: it hands the updater its own copy of the URL params
  const setParam = useCallback(
    (key, value) =>
      setParams(
        (p) => {
          if (value && !(key === 'sort' && value === 'popular')) p.set(key, value)
          else p.delete(key)
          return p
        },
        { replace: true },
      ),
    [setParams],
  )
  const onSearch = useCallback((text) => setParam('q', text), [setParam])
  const hasFilters = FILTER_KEYS.some((k) => params.get(k))
  const resetFilters = () =>
    setParams(
      (p) => {
        FILTER_KEYS.forEach((k) => p.delete(k))
        return p
      },
      { replace: true },
    )

  const courses = result.data
  const sortLabel = SORTS.find((s) => s.id === sort).label

  return (
    <Page className="max-w-[1200px]">
      <header className="mb-8 flex items-center justify-between gap-6">
        <div>
          <h1 className="text-[2em] leading-tight font-extrabold tracking-[-0.01em]">Partner courses</h1>
          <p className="mt-1.5 max-w-xl text-muted-foreground">
            Hand-picked courses from our e-learning partners. Learn at your own pace, tooli keeps track of your progress.
          </p>
        </div>
        <Mascot pose="explaining" size={84} title="" aria-hidden="true" className="shrink-0 max-xs:hidden" />
      </header>

      <ContinueRow />

      <section aria-labelledby="catalogue-title">
        <h2 id="catalogue-title" className="sr-only">
          All courses
        </h2>

        <div className="mb-4 flex gap-3">
          <SearchBox value={q} onSearch={onSearch} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-11 shrink-0 rounded-xl bg-card" aria-label={`Sort courses: ${sortLabel}`}>
                <ArrowUpDown aria-hidden="true" />
                <span className="max-xs:hidden">{sortLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl p-1.5 ring-0 border border-border">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort} onValueChange={(v) => setParam('sort', v)}>
                {SORTS.map((s) => (
                  <DropdownMenuRadioItem key={s.id} value={s.id} className="py-2 text-sm font-semibold">
                    {s.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="mb-6 flex flex-col gap-3">
          {options.data ? (
            <>
              <ChipGroup
                label="Subject"
                value={subject}
                onChange={(v) => setParam('subject', v)}
                options={options.data.subjects.map((s) => ({ value: s, label: s }))}
              />
              <ChipGroup
                label="Level"
                value={level}
                onChange={(v) => setParam('level', v)}
                options={options.data.levels.map((l) => ({ value: l, label: l }))}
              />
              <ChipGroup
                label="Platform"
                value={platform}
                onChange={(v) => setParam('platform', v)}
                options={options.data.platforms.map((p) => ({ value: p.id, label: p.name }))}
              />
            </>
          ) : (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-8 w-full max-w-2xl rounded-full" />)
          )}
        </div>

        <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {courses && !result.loading && `${courses.length} ${courses.length === 1 ? 'course' : 'courses'}`}
          </p>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X aria-hidden="true" /> Reset filters
            </Button>
          )}
        </div>

        {result.loading && !courses ? (
          <CardGridSkeleton count={6} className="h-[290px]" />
        ) : result.error ? (
          <ErrorState onRetry={result.reload} />
        ) : courses.length === 0 ? (
          <MascotMessage
            pose="sleepy"
            title="No course matches your search"
            text="Try another filter or a different word. New courses arrive every month!"
            action={
              <Button onClick={resetFilters}>
                <RefreshCw aria-hidden="true" /> Reset filters
              </Button>
            }
          />
        ) : (
          <motion.ul
            key={courses.map((c) => c.id).join()} // replay the stagger when the results change
            className={cn(
              'grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-4 transition-opacity',
              result.loading && 'opacity-60',
            )}
            variants={stagger(0.05)}
            {...entrance}
            aria-busy={result.loading}
          >
            {courses.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </motion.ul>
        )}
      </section>
    </Page>
  )
}

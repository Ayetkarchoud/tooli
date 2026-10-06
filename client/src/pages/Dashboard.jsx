import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Lightbulb, RefreshCw, SendHorizontal, Star } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatPercent, formatRating } from '@/lib/numbers'
import { usePageTitle } from '@/lib/usePageTitle'
import { fullName, getInitials } from '@/lib/people'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { fadeUp, hoverLift, liftOnHover, stagger, useEntrance } from '@/lib/motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { getContinueLearning } from '@/services/courses'
import { getTopProfessors } from '@/services/professors'
import { getLearningTips } from '@/services/tutor'
import Mascot from '../components/Mascot.jsx'
import Page from '../components/Page.jsx'
import { CardGridSkeleton } from '../components/PageLoader.jsx'
import { useAuth } from '../auth/authContext.js'
import { SERVICES, servicePath } from '../data/tooliServices.js'
import Greeting from './dashboard/Greeting.jsx'
import YourWeek from './dashboard/YourWeek.jsx'

const MotionLink = motion.create(Link)
const MotionCard = motion.create(Card)

// Example questions: dashboard.ask.suggestions.<key>
const SUGGESTIONS = ['photosynthesis', 'equation', 'english']

// Random index in [0, length), different from `exclude` when possible
function randomIndex(length, exclude) {
  let i = Math.floor(Math.random() * length)
  while (length > 1 && i === exclude) i = Math.floor(Math.random() * length)
  return i
}

function SectionTitle({ className, ...props }) {
  return <h2 className={cn('mb-3.5 text-lg font-semibold', className)} {...props} />
}

function AskBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

  const ask = (q) => {
    const text = q.trim()
    if (text) navigate(`/dashboard/tutor?q=${encodeURIComponent(text)}`)
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary p-7 [background:linear-gradient(135deg,var(--color-primary-soft),var(--color-accent-soft)),var(--color-surface)] max-[560px]:p-5">
      <div>
        <h2 className="text-[22px] leading-tight font-semibold max-[560px]:text-[19px]">{t('dashboard.ask.title')}</h2>
        <p className="mt-1 text-muted-foreground">{t('dashboard.ask.text')}</p>
      </div>

      <form
        className="flex gap-2.5"
        onSubmit={(e) => {
          e.preventDefault()
          ask(question)
        }}
      >
        <Input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder={t('dashboard.ask.placeholder')}
          aria-label={t('dashboard.ask.label')}
          className="h-[58px] flex-1 rounded-xl bg-card px-5 text-base focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-accent md:text-base dark:bg-card max-[560px]:h-[52px]"
        />
        <Button
          type="submit"
          disabled={!question.trim()}
          aria-label={t('dashboard.ask.send')}
          className="h-[58px] rounded-xl px-6 text-[15px] transition-[translate,box-shadow,opacity] hover:-translate-y-0.5 hover:bg-primary hover:shadow-lift disabled:opacity-55 motion-reduce:hover:translate-y-0 max-[560px]:size-[52px] max-[560px]:px-0 [&_svg:not([class*='size-'])]:size-5"
        >
          <SendHorizontal aria-hidden="true" className="rtl:-scale-x-100" />
          <span className="max-[560px]:hidden">{t('dashboard.ask.submit')}</span>
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((key) => (
          <Button
            key={key}
            type="button"
            variant="pill"
            size="sm"
            className="bg-card font-normal"
            onClick={() => ask(t(`dashboard.ask.suggestions.${key}`))}
          >
            {t(`dashboard.ask.suggestions.${key}`)}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ServiceCardBody({ service, number }) {
  const { t } = useTranslation()
  const { key, icon: Icon, soon } = service

  return (
    <>
      <div className="flex items-start justify-between">
        <span className={cn('grid size-[46px] place-items-center rounded-lg bg-accent text-primary-text', soon && 'opacity-70')}>
          <Icon size={22} aria-hidden="true" />
        </span>
        {soon ? (
          <Badge variant="highlight">{t('common.soon')}</Badge>
        ) : (
          <span className="grid size-[26px] place-items-center rounded-full border border-primary-text text-xs font-semibold text-primary-text">
            {number}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold">{t(`services.${key}.title`)}</h3>
        <p className="mt-1 text-sm leading-normal text-muted-foreground">{t(`services.${key}.text`)}</p>
      </div>
      {!soon && (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-text">
          {t(`services.${key}.cta`)}
          <ArrowRight
            size={16}
            className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            aria-hidden="true"
          />
        </span>
      )}
    </>
  )
}

function ServiceCard({ service, number }) {
  const cardClass = 'h-full gap-4 p-5 text-foreground'

  if (service.soon) {
    return (
      <Card className={cn(cardClass, 'border-dashed')}>
        <ServiceCardBody service={service} number={number} />
      </Card>
    )
  }

  return (
    <MotionLink to={servicePath(service.slug)} className="group block rounded-2xl no-underline" {...liftOnHover}>
      <Card className={cn(cardClass, 'transition-[border-color,box-shadow] group-hover:border-primary group-hover:shadow-lift')}>
        <ServiceCardBody service={service} number={number} />
      </Card>
    </MotionLink>
  )
}

// A small error line with a retry button, for one dashboard section
function SectionError({ onRetry }) {
  const { t } = useTranslation()
  return (
    <Card className="flex-1 items-start gap-3 p-5" role="alert">
      <p className="text-muted-foreground">{t('dashboard.sectionError')}</p>
      <Button type="button" variant="pill" size="sm" onClick={onRetry}>
        <RefreshCw aria-hidden="true" /> {t('common.tryAgain')}
      </Button>
    </Card>
  )
}

function ContinueLearning() {
  const { t } = useTranslation()
  const { data: courses, error, loading, reload } = useAsync(getContinueLearning, [])

  if (loading) {
    return (
      <Card className="flex-1 gap-0 py-0" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-3 border-t border-border px-5 py-[18px] first:border-t-0">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
        <span className="sr-only" role="status">
          {t('dashboard.continue.loading')}
        </span>
      </Card>
    )
  }
  if (error) return <SectionError onRetry={reload} />
  if (courses.length === 0) {
    return (
      <Card className="flex-1 items-center gap-3 p-6 text-center">
        <Mascot pose="explaining" size={72} title="" aria-hidden="true" />
        <p className="font-semibold">{t('dashboard.continue.empty')}</p>
        <Button asChild variant="pill" size="sm">
          <Link to="/dashboard/courses">
            {t('services.courses.cta')} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
          </Link>
        </Button>
      </Card>
    )
  }

  return (
    <Card className="flex-1 gap-0 py-0">
      {courses.map((c) => (
        <div
          key={c.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 border-t border-border px-5 py-[18px] first:border-t-0 max-[560px]:p-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">{c.platform.name}</span>
            <h3 className="mt-0.5 text-[15px] font-semibold">{c.title}</h3>
          </div>
          <Button asChild variant="pill" size="sm">
            <Link to={`/dashboard/courses/${c.id}`} aria-label={t('courses.resumeLabel', { title: c.title })}>
              {t('courses.resume')} <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
            </Link>
          </Button>
          <div className="col-span-full flex items-center gap-3">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full border border-border bg-background"
              role="progressbar"
              aria-valuenow={c.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={t('courses.progressLabel', { title: c.title })}
            >
              <span className="block h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
            </div>
            <span className="min-w-[38px] text-end text-[13px] font-semibold">{formatPercent(c.progress)}</span>
          </div>
        </div>
      ))}
    </Card>
  )
}

function TipOfTheDay() {
  const { t } = useTranslation()
  const { data: tips, error, loading, reload } = useAsync(getLearningTips, [])
  // Which tip is shown; picked at random once the tips arrive
  const [index, setIndex] = useState(null)
  if (tips?.length && index === null) setIndex(randomIndex(tips.length))
  const shown = tips?.[index ?? 0]

  if (loading) {
    return (
      <Card className="flex-1 justify-between gap-6 p-6" aria-busy="true">
        <div className="flex flex-col gap-2.5">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-11/12" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <Skeleton className="h-8 w-24 rounded-full" />
      </Card>
    )
  }
  if (error || !shown) return <SectionError onRetry={reload} />

  return (
    <Card className="relative flex-1 justify-between gap-6 overflow-hidden p-6">
      <Lightbulb
        className="pointer-events-none absolute -end-3.5 -top-3.5 text-primary opacity-12"
        size={128}
        aria-hidden="true"
      />
      <p className="relative text-base leading-[1.6] font-semibold" aria-live="polite">
        {shown.text}
      </p>
      <Button
        type="button"
        variant="pill"
        size="sm"
        className="self-start"
        onClick={() => setIndex(randomIndex(tips.length, index))}
      >
        <RefreshCw aria-hidden="true" /> {t('dashboard.tip.next')}
      </Button>
    </Card>
  )
}

// The whole card opens the professor's page (stretched link on the name); so does "Book a class"
function ProfessorCard({ prof }) {
  const { t } = useTranslation()
  const profPath = `/dashboard/professors/${prof.id}`

  return (
    <MotionCard className="relative h-full items-start gap-3 p-5 transition-shadow hover:shadow-lift" {...hoverLift}>
      <Avatar className="size-[52px] after:hidden" aria-hidden="true">
        <AvatarFallback className="border border-highlight bg-highlight-soft text-base font-semibold text-foreground">
          {getInitials(prof)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-base font-semibold">
          <Link to={profPath} className="text-foreground no-underline after:absolute after:inset-0 after:rounded-2xl">
            {fullName(prof)}
          </Link>
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t(`subjects.${prof.subject}`)} · {t(`cities.${prof.city}`)}
        </p>
      </div>
      <p className="flex items-center gap-1.5 text-sm">
        <Star size={16} className="text-highlight" fill="currentColor" aria-hidden="true" />
        <strong>{formatRating(prof.rating)}</strong>
        <span className="text-[13px] text-muted-foreground">({t('professors.reviewCount', { count: prof.reviews })})</span>
      </p>
      <Button asChild className="relative z-10 mt-auto w-full">
        <Link to={profPath} aria-label={t('professors.bookWith', { name: fullName(prof) })}>
          {t('professors.book')}
        </Link>
      </Button>
    </MotionCard>
  )
}

function TopProfessors() {
  const { data: professors, error, loading, reload } = useAsync(() => getTopProfessors(3), [])

  if (loading) return <CardGridSkeleton count={3} className="h-[238px]" />
  if (error) return <SectionError onRetry={reload} />
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
      {professors.map((p) => (
        <ProfessorCard key={p.id} prof={p} />
      ))}
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const { user } = useAuth()
  usePageTitle(t('nav.dashboard'))
  const entrance = useEntrance()

  return (
    <Page as={motion.div} className="flex flex-col gap-9 max-[560px]:gap-7" variants={stagger()} {...entrance}>
      <motion.header variants={fadeUp}>
        <Greeting firstName={user.firstName} />
      </motion.header>

      <motion.div variants={fadeUp}>
        <YourWeek />
      </motion.div>

      <motion.section variants={fadeUp}>
        <AskBar />
      </motion.section>

      <motion.section variants={fadeUp}>
        <SectionTitle>{t('landing.services.title')}</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.key} service={s} number={i + 1} />
          ))}
        </div>
      </motion.section>

      <motion.div variants={fadeUp} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 max-lg:grid-cols-[minmax(0,1fr)]">
        <section className="flex flex-col">
          <SectionTitle>{t('dashboard.continue.title')}</SectionTitle>
          <ContinueLearning />
        </section>
        <section className="flex flex-col">
          <SectionTitle>{t('dashboard.tip.title')}</SectionTitle>
          <TipOfTheDay />
        </section>
      </motion.div>

      <motion.section variants={fadeUp}>
        <div className="flex items-baseline justify-between gap-3">
          <SectionTitle>{t('dashboard.topProfessors')}</SectionTitle>
          <Link to="/dashboard/professors" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-text no-underline">
            {t('common.seeAll')} <ArrowRight size={14} aria-hidden="true" className="rtl:-scale-x-100" />
          </Link>
        </div>
        <TopProfessors />
      </motion.section>
    </Page>
  )
}

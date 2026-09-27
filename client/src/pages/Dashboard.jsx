import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Lightbulb, RefreshCw, SendHorizontal, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fadeUp, liftOnHover, stagger, useEntrance } from '@/lib/motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Mascot from '../components/Mascot.jsx'
import Page from '../components/Page.jsx'
import { useAuth } from '../auth/authContext.js'
import { continueCourses, getInitials, learningTips, vipProfessors } from '../data/mock.js'
import { SERVICES, servicePath } from '../data/services.js'

const MotionLink = motion.create(Link)
const MotionCard = motion.create(Card)

const SUGGESTIONS = ['Explain photosynthesis simply', 'How do I solve 2x + 5 = 13?', 'Tips to learn English faster']

function getGreeting(hour) {
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function randomTipIndex(exclude) {
  let i = Math.floor(Math.random() * learningTips.length)
  while (learningTips.length > 1 && i === exclude) i = Math.floor(Math.random() * learningTips.length)
  return i
}

function SectionTitle({ className, ...props }) {
  return <h2 className={cn('mb-3.5 text-lg font-semibold', className)} {...props} />
}

function AskBar() {
  const navigate = useNavigate()
  const [question, setQuestion] = useState('')

  const ask = (q) => {
    const text = q.trim()
    if (text) navigate(`/dashboard/tutor?q=${encodeURIComponent(text)}`)
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-primary p-7 [background:linear-gradient(135deg,var(--color-primary-soft),var(--color-accent-soft)),var(--color-surface)] max-[560px]:p-5">
      <div>
        <h2 className="text-[22px] leading-tight font-semibold max-[560px]:text-[19px]">Ask tooli anything</h2>
        <p className="mt-1 text-muted-foreground">Homework, exams, a tricky concept: get a clear answer in seconds.</p>
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
          placeholder="Type your question…"
          aria-label="Your question for tooli"
          className="h-[58px] flex-1 rounded-xl bg-card px-5 text-base focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-accent md:text-base dark:bg-card max-[560px]:h-[52px]"
        />
        <Button
          type="submit"
          disabled={!question.trim()}
          aria-label="Send question"
          className="h-[58px] rounded-xl px-6 text-[15px] transition-[translate,box-shadow,opacity] hover:-translate-y-0.5 hover:bg-primary hover:shadow-lift disabled:opacity-55 motion-reduce:hover:translate-y-0 max-[560px]:size-[52px] max-[560px]:px-0 [&_svg:not([class*='size-'])]:size-5"
        >
          <SendHorizontal aria-hidden="true" />
          <span className="max-[560px]:hidden">Ask</span>
        </Button>
      </form>

      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <Button key={s} type="button" variant="pill" size="sm" className="bg-card font-normal" onClick={() => ask(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  )
}

function ServiceCardBody({ service, number }) {
  const { title, text, icon: Icon, cta, soon } = service

  return (
    <>
      <div className="flex items-start justify-between">
        <span className={cn('grid size-[46px] place-items-center rounded-lg bg-accent text-primary-text', soon && 'opacity-70')}>
          <Icon size={22} aria-hidden="true" />
        </span>
        {soon ? (
          <Badge variant="highlight">Soon</Badge>
        ) : (
          <span className="grid size-[26px] place-items-center rounded-full border border-primary-text text-xs font-semibold text-primary-text">
            {number}
          </span>
        )}
      </div>
      <div className="flex-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm leading-normal text-muted-foreground">{text}</p>
      </div>
      {!soon && (
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-text">
          {cta}
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true" />
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

function ContinueLearning() {
  return (
    <Card className="flex-1 gap-0 py-0">
      {continueCourses.map((c) => (
        <div
          key={c.id}
          className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2.5 border-t border-border px-5 py-[18px] first:border-t-0 max-[560px]:p-4"
        >
          <div>
            <span className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">{c.platform}</span>
            <h3 className="mt-0.5 text-[15px] font-semibold">{c.title}</h3>
          </div>
          <Button asChild variant="pill" size="sm">
            <Link to={c.to}>
              Resume <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
          <div className="col-span-full flex items-center gap-3">
            <div
              className="h-2 flex-1 overflow-hidden rounded-full border border-border bg-background"
              role="progressbar"
              aria-valuenow={c.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${c.title} progress`}
            >
              <span className="block h-full rounded-full bg-primary" style={{ width: `${c.progress}%` }} />
            </div>
            <span className="min-w-[38px] text-right text-[13px] font-semibold">{c.progress}%</span>
          </div>
        </div>
      ))}
    </Card>
  )
}

function TipOfTheDay() {
  const [index, setIndex] = useState(() => randomTipIndex())

  return (
    <Card className="relative flex-1 justify-between gap-6 overflow-hidden p-6">
      <Lightbulb
        className="pointer-events-none absolute -top-3.5 -right-3.5 text-primary opacity-12"
        size={128}
        aria-hidden="true"
      />
      <p className="relative text-base leading-[1.6] font-semibold" aria-live="polite">
        {learningTips[index]}
      </p>
      <Button type="button" variant="pill" size="sm" className="self-start" onClick={() => setIndex((i) => randomTipIndex(i))}>
        <RefreshCw aria-hidden="true" /> New tip
      </Button>
    </Card>
  )
}

function ProfessorCard({ prof }) {
  return (
    <MotionCard
      className="h-full items-start gap-3 p-5 transition-shadow hover:shadow-lift"
      {...liftOnHover}
    >
      <Avatar className="size-[52px] after:hidden" aria-hidden="true">
        <AvatarFallback className="border border-highlight bg-highlight-soft text-base font-semibold text-foreground">
          {getInitials(prof)}
        </AvatarFallback>
      </Avatar>
      <div>
        <h3 className="text-base font-semibold">
          {prof.title} {prof.firstName} {prof.lastName}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">{prof.subject}</p>
      </div>
      <p className="flex items-center gap-1.5 text-sm">
        <Star size={16} className="text-highlight" fill="currentColor" aria-hidden="true" />
        <strong>{prof.rating.toFixed(1)}</strong>
        <span className="text-[13px] text-muted-foreground">({prof.reviews} reviews)</span>
      </p>
      <Button asChild className="mt-auto w-full">
        <Link to="/dashboard/professors">Book a class</Link>
      </Button>
    </MotionCard>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const entrance = useEntrance()
  const now = new Date()
  const today = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Page as={motion.div} className="flex max-w-[1200px] flex-col gap-9 max-[560px]:gap-7" variants={stagger()} {...entrance}>
      <motion.header variants={fadeUp}>
        <div className="flex items-center gap-4 max-[560px]:gap-3">
          <Mascot pose="waving" size={64} className="shrink-0 max-[560px]:h-auto max-[560px]:w-[52px]" />
          <div>
            <h1 className="text-[28px] leading-tight font-semibold max-[560px]:text-[22px]">
              {getGreeting(now.getHours())}, {user.firstName}
            </h1>
            <p className="mt-1 text-muted-foreground">{today}</p>
          </div>
        </div>
      </motion.header>

      <motion.section variants={fadeUp}>
        <AskBar />
      </motion.section>

      <motion.section variants={fadeUp}>
        <SectionTitle>Our services</SectionTitle>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.title} service={s} number={i + 1} />
          ))}
        </div>
      </motion.section>

      <motion.div variants={fadeUp} className="grid grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 max-lg:grid-cols-[minmax(0,1fr)]">
        <section className="flex flex-col">
          <SectionTitle>Continue learning</SectionTitle>
          <ContinueLearning />
        </section>
        <section className="flex flex-col">
          <SectionTitle>Tip of the day</SectionTitle>
          <TipOfTheDay />
        </section>
      </motion.div>

      <motion.section variants={fadeUp}>
        <div className="flex items-baseline justify-between gap-3">
          <SectionTitle>Top VIP professors</SectionTitle>
          <Link to="/dashboard/professors" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-text no-underline">
            See all <ArrowRight size={14} aria-hidden="true" />
          </Link>
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          {vipProfessors.map((p) => (
            <ProfessorCard key={p.id} prof={p} />
          ))}
        </div>
      </motion.section>
    </Page>
  )
}

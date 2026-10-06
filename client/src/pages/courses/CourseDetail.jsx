// One course: hero (cover, info, Start/Resume), progress, lessons, what you'll learn, ask the tutor.
// "Mark as done" on the next lesson updates the progress and celebrates (bigger when the course is complete).

import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, Check, CheckCheck, CheckCircle2, ChevronRight, Clock, Lock, MessagesSquare, Play, PlayCircle, Star } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { formatPercent, formatRating } from '@/lib/numbers'
import { usePageTitle } from '@/lib/usePageTitle'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { formatDuration } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getCourse, setLessonDone } from '@/services/courses'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Celebration from '../../components/Celebration.jsx'
import CourseCover from '../../components/CourseCover.jsx'
import LoadState from '../../components/LoadState.jsx'
import Page from '../../components/Page.jsx'
import ProgressRing from '../../components/ProgressRing.jsx'

// Lessons unlock in order: done ✓, then the next one, then locked
function lessonStatuses(lessons) {
  const next = lessons.findIndex((l) => !l.done)
  return lessons.map((l, i) => (l.done ? 'done' : i === next ? 'next' : 'locked'))
}

function Breadcrumb({ title }) {
  const { t } = useTranslation()
  return (
    <nav aria-label={t('common.breadcrumb')} className="mb-5 text-sm">
      <ol className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <li>
          <Link to="/dashboard/courses" className="font-semibold text-primary-text no-underline hover:underline">
            {t('nav.coursesShort')}
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight size={14} className="rtl:-scale-x-100" />
        </li>
        <li className="min-w-0 truncate" aria-current="page">
          {title}
        </li>
      </ol>
    </nav>
  )
}

function Hero({ course, statuses }) {
  const { t } = useTranslation()
  const { title, platform, subject, level, durationMinutes, lessons, rating, reviews, description, progress } = course
  const doneCount = statuses.filter((s) => s === 'done').length
  const nextLesson = lessons[statuses.indexOf('next')]
  const action = progress === null ? t('courses.start') : progress === 100 ? t('courses.review') : t('courses.resume')
  const tutorQuestion = nextLesson
    ? t('courses.tutorQuestion', { title, platform: platform.name, lesson: nextLesson.title })
    : t('courses.tutorQuiz', { title, platform: platform.name })

  const open = () => {
    // TODO: open the partner platform once we have real links: window.open(platform.url, '_blank', 'noopener')
    toast(t('courses.opening', { platform: platform.name }), { description: t('courses.openingText', { title }) })
  }

  return (
    <motion.section variants={fadeUp} className="overflow-hidden rounded-3xl border border-border bg-card lg:grid lg:grid-cols-[minmax(0,380px)_1fr]">
      <CourseCover cover={platform.cover} subject={subject} size="lg" className="h-44 lg:h-full lg:min-h-[320px]" />

      <div className="flex flex-col gap-4 p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="h-auto px-2.5 py-0.5 text-xs font-semibold">
            {platform.name}
          </Badge>
          <Badge variant="highlight" className="text-xs">
            {t(`levels.${level}`)}
          </Badge>
        </div>

        <div>
          <h1 className="text-[clamp(24px,3.2vw,32px)] leading-tight font-extrabold tracking-[-0.01em]">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label={t('courses.details')}>
          <li className="inline-flex items-center gap-1.5">
            <Clock size={16} className="text-primary-text" aria-hidden="true" /> {formatDuration(durationMinutes)}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <BookOpen size={16} className="text-primary-text" aria-hidden="true" /> {t('courses.lessonCount', { count: lessons.length })}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Star size={16} className="text-highlight" fill="currentColor" aria-hidden="true" />
            <strong>{formatRating(rating)}</strong>
            <span className="text-muted-foreground">({t('professors.reviewCount', { count: reviews })})</span>
          </li>
        </ul>

        <div className="flex items-center gap-4 rounded-2xl bg-muted/60 p-3.5">
          <ProgressRing value={progress ?? 0} size={64} label={t('courses.yourProgress', { percent: formatPercent(progress ?? 0) })} />
          <div className="min-w-0 text-sm">
            <p className="font-semibold">
              {progress === null
                ? t('courses.notStarted')
                : progress === 100
                  ? t('courses.completed')
                  : t('courses.lessonsDone', { done: doneCount, count: lessons.length })}
            </p>
            {nextLesson && (
              <p className="truncate text-muted-foreground">
                {t(progress === null ? 'courses.firstLesson' : 'courses.upNextLesson', { title: nextLesson.title })}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button size="lg" onClick={open} className="max-xs:flex-[1_1_100%]">
            <Play aria-hidden="true" /> {action}
          </Button>
          <Button asChild size="lg" variant="outline" className="max-xs:flex-[1_1_100%]">
            <Link to={`/dashboard/tutor?q=${encodeURIComponent(tutorQuestion)}`}>
              <MessagesSquare aria-hidden="true" />
              <span>
                {t('courses.askTutor')}
                <span className="max-xs:sr-only"> {t('courses.aboutCourse')}</span>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

// Labels: courses.status.<key>
const STATUS = {
  done: { icon: CheckCircle2, className: 'text-primary-text' },
  next: { icon: PlayCircle, className: 'text-primary-text' },
  locked: { icon: Lock, className: 'text-muted-foreground' },
}

function Lessons({ lessons, statuses, onMarkDone, marking }) {
  const { t } = useTranslation()
  return (
    <motion.section variants={fadeUp} aria-labelledby="lessons-title">
      <Card className="gap-0 p-0">
        <h2 id="lessons-title" className="border-b border-border px-5 py-4 text-lg font-semibold">
          {t('courses.lessons')}
        </h2>
        <ol>
          {lessons.map((lesson, i) => {
            const status = STATUS[statuses[i]]
            const Icon = status.icon
            return (
              <li
                key={lesson.id}
                className={cn(
                  'flex items-center gap-3.5 border-b border-border px-5 py-3.5 last:border-b-0',
                  statuses[i] === 'next' && 'bg-accent',
                )}
              >
                <Icon size={22} className={cn('shrink-0', status.className)} aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted-foreground">{t('courses.lessonNumber', { n: i + 1 })}</span>
                  <span className={cn('block font-semibold', statuses[i] === 'locked' && 'text-muted-foreground')}>{lesson.title}</span>
                </span>
                {statuses[i] === 'next' && (
                  <Badge className="shrink-0 text-xs max-sm:hidden">{t('courses.status.next')}</Badge>
                )}
                <span className="shrink-0 text-sm text-muted-foreground">{formatDuration(lesson.minutes)}</span>
                {statuses[i] === 'next' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 bg-card"
                    onClick={() => onMarkDone(lesson)}
                    disabled={marking}
                    aria-label={t('courses.markDone', { title: lesson.title })}
                  >
                    <CheckCheck aria-hidden="true" /> <span className="max-xs:sr-only">{t('courses.status.done')}</span>
                  </Button>
                )}
                <span className="sr-only">({t(`courses.status.${statuses[i]}`)})</span>
              </li>
            )
          })}
        </ol>
      </Card>
    </motion.section>
  )
}

function Outcomes({ outcomes }) {
  const { t } = useTranslation()
  return (
    <motion.section variants={fadeUp} aria-labelledby="outcomes-title">
      <Card className="gap-4 p-5">
        <h2 id="outcomes-title" className="text-lg font-semibold">
          {t('courses.outcomes')}
        </h2>
        <ul className="flex flex-col gap-3">
          {outcomes.map((o) => (
            <li key={o} className="flex gap-3">
              <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-accent text-primary-text" aria-hidden="true">
                <Check size={14} strokeWidth={3} />
              </span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </Card>
    </motion.section>
  )
}

function CourseView({ course: initial }) {
  const { t } = useTranslation()
  const entrance = useEntrance()
  const [course, setCourse] = useState(initial)
  const [marking, setMarking] = useState(false)
  const [celebration, setCelebration] = useState(null) // { title, text, complete }
  const statuses = lessonStatuses(course.lessons)

  const markDone = async (lesson) => {
    setMarking(true)
    try {
      const updated = await setLessonDone(course.id, lesson.id, true)
      setCourse(updated)
      const done = updated.lessons.filter((l) => l.done).length
      setCelebration(
        updated.progress === 100
          ? { complete: true, title: t('courses.celebrate.completeTitle'), text: t('courses.celebrate.completeText', { count: done, title: updated.title }) }
          : {
              title: t('courses.celebrate.lessonTitle'),
              text: t('courses.celebrate.lessonText', {
                title: lesson.title,
                done,
                count: updated.lessons.length,
                percent: formatPercent(updated.progress),
              }),
            },
      )
    } catch (err) {
      toast.error(t('common.saveError'), { description: err.message })
    } finally {
      setMarking(false)
    }
  }

  usePageTitle(course.title)
  return (
    <Page>
      <Breadcrumb title={course.title} />
      <motion.div className="flex flex-col gap-6" variants={stagger(0.08)} {...entrance}>
        <Hero course={course} statuses={statuses} />
        <AnimatePresence>
          {celebration && (
            <Celebration
              key={celebration.title + celebration.text}
              title={celebration.title}
              text={celebration.text}
              onClose={() => setCelebration(null)}
              action={
                celebration.complete && (
                  <Button asChild size="sm">
                    <Link to="/dashboard/courses">{t('courses.findNext')}</Link>
                  </Button>
                )
              }
            />
          )}
        </AnimatePresence>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <Lessons lessons={course.lessons} statuses={statuses} onMarkDone={markDone} marking={marking} />
          <Outcomes outcomes={course.outcomes} />
        </div>
      </motion.div>
    </Page>
  )
}

export default function CourseDetail() {
  const { t } = useTranslation()
  const { courseId } = useParams()
  const result = useAsync(() => getCourse(courseId), [courseId])

  return (
    <LoadState
      result={result}
      notFound={{
        title: t('courses.notFound.title'),
        text: t('courses.notFound.text'),
        backTo: '/dashboard/courses',
        backLabel: t('courses.notFound.back'),
      }}
    >
      {(course) => <CourseView course={course} />}
    </LoadState>
  )
}

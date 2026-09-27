// One course: hero (cover, info, Start/Resume), progress, lessons, what you'll learn, ask the tutor.

import { Link, useParams } from 'react-router-dom'
import { motion } from 'motion/react'
import { BookOpen, Check, CheckCircle2, ChevronRight, Clock, Lock, MessagesSquare, Play, PlayCircle, Star } from 'lucide-react'
import { toast } from 'sonner'
import { fadeUp, stagger, useEntrance } from '@/lib/motion'
import { formatDuration } from '@/lib/time'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getCourse } from '@/services/courses'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
  return (
    <nav aria-label="Breadcrumb" className="mb-5 text-sm">
      <ol className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
        <li>
          <Link to="/dashboard/courses" className="font-semibold text-primary-text no-underline hover:underline">
            Courses
          </Link>
        </li>
        <li aria-hidden="true">
          <ChevronRight size={14} />
        </li>
        <li className="min-w-0 truncate" aria-current="page">
          {title}
        </li>
      </ol>
    </nav>
  )
}

function Hero({ course, statuses }) {
  const { title, platform, subject, level, durationMinutes, lessons, rating, reviews, description, progress } = course
  const doneCount = statuses.filter((s) => s === 'done').length
  const nextLesson = lessons[statuses.indexOf('next')]
  const action = progress === null ? 'Start course' : progress === 100 ? 'Review course' : 'Resume'
  const tutorQuestion = nextLesson
    ? `I'm following "${title}" on ${platform.name}. Can you help me understand "${nextLesson.title}"?`
    : `I finished "${title}" on ${platform.name}. Can you quiz me on the main ideas?`

  const open = () => {
    // TODO: open the partner platform once we have real links: window.open(platform.url, '_blank', 'noopener')
    toast(`Opening ${platform.name}…`, { description: `“${title}” will open in a new tab.` })
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
            {level}
          </Badge>
        </div>

        <div>
          <h1 className="text-[clamp(24px,3.2vw,32px)] leading-tight font-extrabold tracking-[-0.01em]">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{description}</p>
        </div>

        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm" aria-label="Course details">
          <li className="inline-flex items-center gap-1.5">
            <Clock size={16} className="text-primary-text" aria-hidden="true" /> {formatDuration(durationMinutes)}
          </li>
          <li className="inline-flex items-center gap-1.5">
            <BookOpen size={16} className="text-primary-text" aria-hidden="true" /> {lessons.length} lessons
          </li>
          <li className="inline-flex items-center gap-1.5">
            <Star size={16} className="text-highlight" fill="currentColor" aria-hidden="true" />
            <strong>{rating.toFixed(1)}</strong>
            <span className="text-muted-foreground">({reviews} reviews)</span>
          </li>
        </ul>

        <div className="flex items-center gap-4 rounded-2xl bg-muted/60 p-3.5">
          <ProgressRing value={progress ?? 0} size={64} label={`Your progress: ${progress ?? 0}%`} />
          <div className="min-w-0 text-sm">
            <p className="font-semibold">
              {progress === null ? 'Not started yet' : progress === 100 ? 'Course completed, well done!' : `${doneCount} of ${lessons.length} lessons done`}
            </p>
            {nextLesson && (
              <p className="truncate text-muted-foreground">
                {progress === null ? 'First lesson' : 'Up next'}: {nextLesson.title}
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
              <MessagesSquare aria-hidden="true" /> Ask the AI tutor<span className="max-xs:sr-only"> about this course</span>
            </Link>
          </Button>
        </div>
      </div>
    </motion.section>
  )
}

const STATUS = {
  done: { icon: CheckCircle2, label: 'Done', className: 'text-primary-text' },
  next: { icon: PlayCircle, label: 'Up next', className: 'text-primary-text' },
  locked: { icon: Lock, label: 'Locked', className: 'text-muted-foreground' },
}

function Lessons({ lessons, statuses }) {
  return (
    <motion.section variants={fadeUp} aria-labelledby="lessons-title">
      <Card className="gap-0 p-0">
        <h2 id="lessons-title" className="border-b border-border px-5 py-4 text-lg font-semibold">
          Lessons
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
                  <span className="block text-xs text-muted-foreground">Lesson {i + 1}</span>
                  <span className={cn('block font-semibold', statuses[i] === 'locked' && 'text-muted-foreground')}>{lesson.title}</span>
                </span>
                {statuses[i] === 'next' && (
                  <Badge className="shrink-0 text-xs max-xs:hidden">Up next</Badge>
                )}
                <span className="shrink-0 text-sm text-muted-foreground">{lesson.minutes} min</span>
                <span className="sr-only">({status.label})</span>
              </li>
            )
          })}
        </ol>
      </Card>
    </motion.section>
  )
}

function Outcomes({ outcomes }) {
  return (
    <motion.section variants={fadeUp} aria-labelledby="outcomes-title">
      <Card className="gap-4 p-5">
        <h2 id="outcomes-title" className="text-lg font-semibold">
          What you’ll learn
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

function CourseView({ course }) {
  const entrance = useEntrance()
  const statuses = lessonStatuses(course.lessons)

  return (
    <Page className="max-w-[1200px]">
      <Breadcrumb title={course.title} />
      <motion.div className="flex flex-col gap-6" variants={stagger(0.08)} {...entrance}>
        <Hero course={course} statuses={statuses} />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <Lessons lessons={course.lessons} statuses={statuses} />
          <Outcomes outcomes={course.outcomes} />
        </div>
      </motion.div>
    </Page>
  )
}

export default function CourseDetail() {
  const { courseId } = useParams()
  const result = useAsync(() => getCourse(courseId), [courseId])

  return (
    <LoadState
      result={result}
      notFound={{
        title: 'Course not found',
        text: 'This course may have been removed, or the link has a typo.',
        backTo: '/dashboard/courses',
        backLabel: 'See all courses',
      }}
    >
      {(course) => <CourseView course={course} />}
    </LoadState>
  )
}

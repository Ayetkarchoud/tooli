// One course in the catalogue grid: cover, platform, title, level, duration, rating, progress.

import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Clock, GraduationCap, Star } from 'lucide-react'
import { fadeUp, liftOnHover } from '@/lib/motion'
import { formatDuration } from '@/lib/time'
import { Badge } from '@/components/ui/badge'
import CourseCover from '../../components/CourseCover.jsx'

const MotionLink = motion.create(Link)

export default function CourseCard({ course }) {
  const { id, title, platform, subject, level, durationMinutes, rating, reviews, progress } = course

  return (
    <motion.li variants={fadeUp} className="h-full">
      <MotionLink
        to={`/dashboard/courses/${id}`}
        className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card text-foreground no-underline transition-[border-color,box-shadow] hover:border-primary hover:shadow-lift"
        {...liftOnHover}
      >
        <div className="relative">
          <CourseCover cover={platform.cover} subject={subject} className="h-32" />
          <Badge className="absolute top-3 left-3 border-0 bg-card/90 px-2.5 py-0.5 text-xs font-semibold text-foreground backdrop-blur-sm">
            {platform.name}
          </Badge>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-4">
          <p className="text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">{subject}</p>
          <h3 className="line-clamp-2 text-base leading-snug font-semibold">{title}</h3>

          <p className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <GraduationCap size={14} aria-hidden="true" /> {level}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock size={14} aria-hidden="true" /> {formatDuration(durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Star size={14} className="text-highlight" fill="currentColor" aria-hidden="true" />
              <span className="font-semibold text-foreground">{rating.toFixed(1)}</span>
              <span className="sr-only">out of 5,</span> ({reviews})
            </span>
          </p>

          {progress > 0 && (
            <div className="flex items-center gap-2.5 pt-1">
              <div
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${title}: ${progress}% done`}
              >
                <span className="block h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs font-semibold">{progress}%</span>
            </div>
          )}
        </div>
      </MotionLink>
    </motion.li>
  )
}

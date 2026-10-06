// Chat bubbles: the student's question, the tutor's answer (+ actions), "thinking…" and a failed send.

import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Copy, Lightbulb, RefreshCw, Sparkles, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useDirectionSign } from '@/lib/motion'
import { cn } from '@/lib/utils'
import FormattedText from '@/lib/formatText'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import Mascot from '../../components/Mascot.jsx'

// Follow-up questions sent by the action chips: tutor.followUps.simpler / .example

// Slide in from the side the bubble sits on (only for new messages). The student's bubbles sit on the
// end side (right, or left in Arabic), the tutor's on the start side.
function useBubbleMotion(fromEnd, animate) {
  const reduce = useReducedMotion()
  const dir = useDirectionSign()
  if (!animate || reduce) return {}
  return {
    initial: { opacity: 0, x: (fromEnd ? 12 : -12) * dir, y: 6 },
    animate: { opacity: 1, x: 0, y: 0 },
    transition: { type: 'spring', stiffness: 380, damping: 32 },
  }
}

function TutorAvatar({ pose = 'explaining' }) {
  return (
    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-accent" aria-hidden="true">
      <Mascot pose={pose} size={30} title="" animated={pose === 'thinking'} />
    </span>
  )
}

export function UserBubble({ message, fresh }) {
  const { t } = useTranslation()
  const bubbleMotion = useBubbleMotion(true, fresh)
  return (
    <motion.li className="flex justify-end" {...bubbleMotion}>
      <div className="max-w-[min(80%,36rem)] rounded-2xl rounded-ee-md bg-primary px-4 py-2.5 text-primary-foreground">
        <span className="sr-only">{t('tutor.you')} </span>
        {/* dir="auto": a French question stays left-to-right inside the Arabic interface (and vice versa) */}
        <p dir="auto" className="break-words whitespace-pre-wrap">
          {message.text}
        </p>
      </div>
    </motion.li>
  )
}

// Small icon button with a tooltip (the tooltip text is also its accessible name)
function ActionButton({ label, onClick, disabled, pressed, children }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn('text-muted-foreground hover:text-foreground', pressed && 'bg-accent text-foreground')}
          onClick={onClick}
          disabled={disabled}
          aria-label={label}
          aria-pressed={pressed}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function TutorMessage({ message, fresh, isLast, busy, onFollowUp }) {
  const { t } = useTranslation()
  const reduce = useReducedMotion()
  const bubbleMotion = useBubbleMotion(false, fresh)
  const [copied, setCopied] = useState(false)
  const [rating, setRating] = useState(null) // 'up' | 'down' | null (visual only for now)
  const copiedTimer = useRef()
  useEffect(() => () => clearTimeout(copiedTimer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message.text)
      setCopied(true)
      clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard blocked (old browser / permissions): nothing to do
    }
  }

  return (
    <motion.li className="flex items-start gap-3" {...bubbleMotion}>
      <TutorAvatar />
      <div className="min-w-0 max-w-[min(100%,42rem)] flex-1">
        <div className="rounded-2xl rounded-ss-md border border-border bg-card px-4 py-3.5 text-[15px]">
          <span className="sr-only">{t('tutor.tooli')} </span>
          <FormattedText text={message.text} reveal={fresh && !reduce} />
        </div>

        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          <ActionButton label={copied ? t('tutor.actions.copied') : t('tutor.actions.copy')} onClick={copy}>
            {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          </ActionButton>
          <ActionButton
            label={t('tutor.actions.good')}
            pressed={rating === 'up'}
            onClick={() => setRating((r) => (r === 'up' ? null : 'up'))}
          >
            <ThumbsUp aria-hidden="true" />
          </ActionButton>
          <ActionButton
            label={t('tutor.actions.bad')}
            pressed={rating === 'down'}
            onClick={() => setRating((r) => (r === 'down' ? null : 'down'))}
          >
            <ThumbsDown aria-hidden="true" />
          </ActionButton>
          {isLast && (
            <>
              <Button
                type="button"
                variant="pill"
                size="sm"
                className="ms-1 bg-card"
                disabled={busy}
                onClick={() => onFollowUp(t('tutor.followUps.simpler'))}
              >
                <Sparkles aria-hidden="true" /> {t('tutor.actions.simpler')}
              </Button>
              <Button
                type="button"
                variant="pill"
                size="sm"
                className="bg-card"
                disabled={busy}
                onClick={() => onFollowUp(t('tutor.followUps.example'))}
              >
                <Lightbulb aria-hidden="true" /> {t('tutor.actions.example')}
              </Button>
            </>
          )}
        </div>
        {copied && (
          <span className="sr-only" role="status">
            {t('tutor.actions.copiedStatus')}
          </span>
        )}
      </div>
    </motion.li>
  )
}

// The mascot thinks while three dots bounce
export function ThinkingBubble() {
  const { t } = useTranslation()
  const reduce = useReducedMotion()

  return (
    <motion.li
      className="flex items-start gap-3"
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
    >
      <TutorAvatar pose="thinking" />
      <div className="flex items-center gap-3 rounded-2xl rounded-ss-md border border-border bg-card px-4 py-3.5">
        <span className="flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-2 rounded-full bg-primary"
              animate={reduce ? { opacity: 0.7 } : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
              transition={reduce ? undefined : { duration: 0.9, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
            />
          ))}
        </span>
        <span className="text-sm text-muted-foreground">{t('tutor.thinking')}</span>
      </div>
    </motion.li>
  )
}

// A question that didn't get an answer
export function SendError({ message, onRetry }) {
  const { t } = useTranslation()
  return (
    <motion.li className="flex items-start gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} role="alert">
      <span className="grid size-10 shrink-0 place-items-center" aria-hidden="true">
        <Mascot pose="oops" size={36} title="" animated={false} />
      </span>
      <div className="rounded-2xl rounded-ss-md border border-destructive/40 bg-destructive/8 px-4 py-3">
        <p className="font-semibold">{t('tutor.sendError')}</p>
        <p className="text-sm text-muted-foreground">{message || t('tutor.sendErrorText')}</p>
        <Button type="button" variant="outline" size="sm" className="mt-2.5" onClick={onRetry}>
          <RefreshCw aria-hidden="true" /> {t('common.tryAgain')}
        </Button>
      </div>
    </motion.li>
  )
}

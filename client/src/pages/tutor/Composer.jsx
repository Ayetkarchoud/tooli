// Question box: grows with the text, Enter sends, Shift+Enter adds a line.
// While the tutor thinks it is read-only (not disabled), so keyboard focus stays in it.

import { useLayoutEffect, useRef } from 'react'
import { ArrowUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { MAX_QUESTION_LENGTH } from '@/services/tutor'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const MAX_HEIGHT = 200 // px, then the textarea scrolls
const COUNTER_FROM = Math.round(MAX_QUESTION_LENGTH * 0.8)

// `ref` (a normal prop in React 19) points to the textarea, so the page can focus it
export default function Composer({ value, onChange, onSend, busy, ref }) {
  const { t } = useTranslation()
  const innerRef = useRef(null)
  const setRefs = (el) => {
    innerRef.current = el
    if (typeof ref === 'function') ref(el)
    else if (ref) ref.current = el
  }

  // Auto-grow: shrink to fit, then grow up to MAX_HEIGHT
  useLayoutEffect(() => {
    const el = innerRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT)}px`
  }, [value])

  const canSend = !busy && value.trim().length > 0 && value.length <= MAX_QUESTION_LENGTH
  const submit = (e) => {
    e?.preventDefault()
    if (canSend) onSend(value)
  }

  const onKeyDown = (e) => {
    // Enter sends; Shift+Enter = new line; don't send while an IME is composing (e.g. Arabic input)
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      submit()
    }
  }

  const count = value.length
  const showCounter = count >= COUNTER_FROM

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
      <div
        className={cn(
          'flex items-end gap-2 rounded-2xl border border-border bg-card p-2 ps-4 shadow-[0_8px_24px_-18px_color-mix(in_srgb,var(--color-text)_40%,transparent)] transition-[border-color,box-shadow]',
          'focus-within:border-primary focus-within:ring-3 focus-within:ring-accent',
          busy && 'opacity-80',
        )}
      >
        <label htmlFor="tutor-question" className="sr-only">
          {t('dashboard.ask.label')}
        </label>
        <textarea
          id="tutor-question"
          ref={setRefs}
          rows={1}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={busy}
          aria-disabled={busy || undefined}
          maxLength={MAX_QUESTION_LENGTH}
          dir="auto"
          aria-describedby="tutor-question-help"
          placeholder={busy ? t('tutor.thinking') : t('tutor.placeholder')}
          className="max-h-[200px] min-h-[40px] flex-1 resize-none bg-transparent py-2 text-[15px] leading-6 outline-none placeholder:text-muted-foreground"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button type="submit" size="icon" className="size-10 shrink-0 rounded-xl" disabled={!canSend} aria-label={t('dashboard.ask.send')}>
              <ArrowUp className="size-5" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{t('tutor.sendTooltip')}</TooltipContent>
        </Tooltip>
      </div>

      <div id="tutor-question-help" className="mt-1.5 flex justify-between gap-3 px-2 text-xs text-muted-foreground">
        <span className="max-xs:hidden">
          <kbd className="font-sans font-semibold">Enter</kbd> {t('tutor.enterToSend')} ·{' '}
          <kbd className="font-sans font-semibold">Shift + Enter</kbd> {t('tutor.shiftEnter')}
        </span>
        {showCounter && (
          <span className={cn('ms-auto tabular-nums', count >= MAX_QUESTION_LENGTH && 'font-semibold text-destructive')} aria-live="polite">
            {count} / {MAX_QUESTION_LENGTH}
          </span>
        )}
      </div>
    </form>
  )
}

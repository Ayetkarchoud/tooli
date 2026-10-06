// Labelled form input with a friendly error message underneath.
// Pass `revealable` on a password field to get a show/hide toggle.

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function Field({ id, label, error, hint, revealable = false, type = 'text', ref, ...inputProps }) {
  const { t } = useTranslation()
  const [revealed, setRevealed] = useState(false)
  // The error replaces the hint, so point screen readers at whichever is shown
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined
  const toggleLabel = revealed ? t('auth.hidePassword') : t('auth.showPassword')

  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="leading-normal font-semibold">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          name={id}
          ref={ref}
          type={revealable && revealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            'h-[46px] rounded-lg border-[1.5px] bg-background px-3.5 text-[15px] md:text-[15px] dark:bg-background',
            'focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-accent',
            // error: red border always, red-tinted ring only while focused
            'aria-invalid:ring-0 aria-invalid:focus-visible:ring-3 aria-invalid:focus-visible:ring-destructive/20 dark:aria-invalid:border-destructive',
            revealable && 'pe-12',
          )}
          {...inputProps}
        />
        {revealable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="absolute end-1.5 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                onClick={() => setRevealed((r) => !r)}
                aria-label={toggleLabel}
                aria-pressed={revealed}
                aria-controls={id}
              >
                {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </TooltipTrigger>
            <TooltipContent>{toggleLabel}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="text-[13px] leading-[1.4] text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="text-[13px] leading-[1.4] font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Labelled form input with a friendly error message underneath.
// Pass `revealable` on a password field to get a show/hide toggle.

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Field({ id, label, error, hint, revealable = false, type = 'text', ref, ...inputProps }) {
  const [revealed, setRevealed] = useState(false)
  // The error replaces the hint, so point screen readers at whichever is shown
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field-control">
        <input
          id={id}
          name={id}
          ref={ref}
          type={revealable && revealed ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {revealable && (
          <button
            type="button"
            className="field-toggle"
            onClick={() => setRevealed((r) => !r)}
            aria-label={revealed ? 'Hide password' : 'Show password'}
            aria-pressed={revealed}
            aria-controls={id}
          >
            {revealed ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
          </button>
        )}
      </div>
      {hint && !error && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  )
}

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

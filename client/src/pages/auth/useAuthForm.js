// Form state for login / sign up: values, friendly errors, submit handling.
// Errors show after a field is left (blur) or after a submit attempt, not while typing the first time.

import { useRef, useState } from 'react'

export function useAuthForm({ initial, validate, onSubmit }) {
  const [values, setValues] = useState(initial)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const refs = useRef({})

  const allErrors = validate(values)
  const errorFor = (name) => (touched[name] || submitted ? allErrors[name] : undefined)

  const field = (name) => ({
    id: name,
    value: values[name],
    error: errorFor(name),
    ref: (el) => {
      refs.current[name] = el
    },
    onChange: (e) => setValues((v) => ({ ...v, [name]: e.target.value })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    setFormError('')

    const firstInvalid = Object.keys(initial).find((name) => allErrors[name])
    if (firstInvalid) {
      refs.current[firstInvalid]?.focus()
      return
    }

    setBusy(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setFormError(err?.message || 'Something went wrong. Please try again.')
      setBusy(false)
    }
  }

  return { field, handleSubmit, busy, formError }
}

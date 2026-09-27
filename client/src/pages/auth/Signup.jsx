import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeNext, useAuth } from '../../auth/authContext.js'
import { Button } from '@/components/ui/button'
import AuthShell from './AuthShell.jsx'
import Field, { EMAIL_PATTERN } from './Field.jsx'
import { useAuthForm } from './useAuthForm.js'

const MIN_PASSWORD = 8

function validate({ firstName, lastName, email, password }) {
  const errors = {}
  if (!firstName.trim()) errors.firstName = 'What should we call you?'
  if (!lastName.trim()) errors.lastName = 'Please add your last name too.'
  if (!email.trim()) errors.email = 'We need your email to create your account.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'That email doesn’t look quite right. Check for typos?'
  if (!password) errors.password = 'Choose a password to protect your account.'
  else if (password.length < MIN_PASSWORD) {
    const missing = MIN_PASSWORD - password.length
    errors.password = `Almost there: ${missing} more character${missing > 1 ? 's' : ''} needed (at least ${MIN_PASSWORD}).`
  }
  return errors
}

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')

  const { field, handleSubmit, busy, formError } = useAuthForm({
    initial: { firstName: '', lastName: '', email: '', password: '' },
    validate,
    onSubmit: async (values) => {
      await signup(values)
      navigate(safeNext(next), { replace: true })
    },
  })

  const loginLink = next ? `/login?next=${encodeURIComponent(next)}` : '/login'

  return (
    <AuthShell
      pose="waving"
      mascotTitle="tooli mascot waving hello"
      title="Create your account"
      subtitle="It’s free and takes less than a minute."
      footer={
        <>
          Already have an account? <Link to={loginLink}>Log in</Link>
        </>
      }
    >
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3 max-xs:grid-cols-1">
          <Field label="First name" autoComplete="given-name" {...field('firstName')} />
          <Field label="Last name" autoComplete="family-name" {...field('lastName')} />
        </div>
        <Field label="Email" type="email" autoComplete="email" inputMode="email" {...field('email')} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          hint={`At least ${MIN_PASSWORD} characters.`}
          revealable
          {...field('password')}
        />

        {formError && (
          <p className="rounded-md bg-destructive/12 px-3.5 py-2.5 text-sm font-semibold text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
          {busy ? 'Creating your account…' : 'Create my account'}
        </Button>
      </form>
    </AuthShell>
  )
}

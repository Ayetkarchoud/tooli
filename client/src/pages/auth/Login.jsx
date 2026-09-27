import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeNext, useAuth } from '../../auth/authContext.js'
import { Button } from '@/components/ui/button'
import AuthShell from './AuthShell.jsx'
import Field, { EMAIL_PATTERN } from './Field.jsx'
import { useAuthForm } from './useAuthForm.js'

function validate({ email, password }) {
  const errors = {}
  if (!email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'That email doesn’t look quite right. Check for typos?'
  if (!password) errors.password = 'Please enter your password.'
  return errors
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const next = params.get('next')

  const { field, handleSubmit, busy, formError } = useAuthForm({
    initial: { email: '', password: '' },
    validate,
    onSubmit: async (values) => {
      await login(values)
      navigate(safeNext(next), { replace: true })
    },
  })

  const signupLink = next ? `/signup?next=${encodeURIComponent(next)}` : '/signup'

  return (
    <AuthShell
      pose="thinking"
      mascotTitle="tooli mascot thinking"
      title="Welcome back"
      subtitle="Log in to continue learning with tooli."
      footer={
        <>
          No account? <Link to={signupLink}>Sign up</Link>
        </>
      }
    >
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Field label="Email" type="email" autoComplete="email" inputMode="email" {...field('email')} />
        <Field label="Password" type="password" autoComplete="current-password" revealable {...field('password')} />

        {formError && (
          <p className="rounded-md bg-destructive/12 px-3.5 py-2.5 text-sm font-semibold text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
          {busy ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
    </AuthShell>
  )
}

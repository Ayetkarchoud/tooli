import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeNext, useAuth } from '../../auth/authContext.js'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import AuthShell from './AuthShell.jsx'
import Field, { EMAIL_PATTERN } from './Field.jsx'
import { useAuthForm } from './useAuthForm.js'

const MIN_PASSWORD = 8

function validate({ firstName, lastName, email, password }, t) {
  const errors = {}
  if (!firstName.trim()) errors.firstName = t('auth.errors.firstName')
  if (!lastName.trim()) errors.lastName = t('auth.errors.lastName')
  if (!email.trim()) errors.email = t('auth.errors.emailNeeded')
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = t('auth.errors.emailInvalid')
  if (!password) errors.password = t('auth.errors.passwordChoose')
  else if (password.length < MIN_PASSWORD) {
    errors.password = t('auth.errors.passwordShort', { count: MIN_PASSWORD - password.length, min: MIN_PASSWORD })
  }
  return errors
}

export default function Signup() {
  const { t } = useTranslation()
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
      mascotTitle={t('auth.signup.mascot')}
      title={t('auth.signup.title')}
      subtitle={t('auth.signup.subtitle')}
      footer={
        <>
          {t('auth.signup.haveAccount')} <Link to={loginLink}>{t('auth.login.submit')}</Link>
        </>
      }
    >
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-3 max-xs:grid-cols-1">
          <Field label={t('auth.firstName')} autoComplete="given-name" {...field('firstName')} />
          <Field label={t('auth.lastName')} autoComplete="family-name" {...field('lastName')} />
        </div>
        <Field label={t('auth.email')} type="email" autoComplete="email" inputMode="email" {...field('email')} />
        <Field
          label={t('auth.password')}
          type="password"
          autoComplete="new-password"
          hint={t('auth.passwordHint', { count: MIN_PASSWORD })}
          revealable
          {...field('password')}
        />

        {formError && (
          <p className="rounded-md bg-destructive/12 px-3.5 py-2.5 text-sm font-semibold text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
          {busy ? t('auth.signup.busy') : t('auth.signup.submit')}
        </Button>
      </form>
    </AuthShell>
  )
}

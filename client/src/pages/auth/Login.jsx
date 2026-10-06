import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { safeNext, useAuth } from '../../auth/authContext.js'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import AuthShell from './AuthShell.jsx'
import Field, { EMAIL_PATTERN } from './Field.jsx'
import { useAuthForm } from './useAuthForm.js'

function validate({ email, password }, t) {
  const errors = {}
  if (!email.trim()) errors.email = t('auth.errors.emailMissing')
  else if (!EMAIL_PATTERN.test(email.trim())) errors.email = t('auth.errors.emailInvalid')
  if (!password) errors.password = t('auth.errors.passwordMissing')
  return errors
}

export default function Login() {
  const { t } = useTranslation()
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
      mascotTitle={t('auth.login.mascot')}
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')} <Link to={signupLink}>{t('auth.signup.short')}</Link>
        </>
      }
    >
      <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <Field label={t('auth.email')} type="email" autoComplete="email" inputMode="email" {...field('email')} />
        <Field label={t('auth.password')} type="password" autoComplete="current-password" revealable {...field('password')} />

        {formError && (
          <p className="rounded-md bg-destructive/12 px-3.5 py-2.5 text-sm font-semibold text-destructive" role="alert">
            {formError}
          </p>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" disabled={busy}>
          {busy ? t('auth.login.busy') : t('auth.login.submit')}
        </Button>
      </form>
    </AuthShell>
  )
}

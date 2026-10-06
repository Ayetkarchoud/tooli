// Settings → Profile: name (updates the session too, so the greeting and avatar change), read-only email,
// level / section / school / city / bio from services/user.js. "Save changes" only when something changed.

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import i18n from '@/lib/i18n'
import { useAuth } from '@/auth/authContext'
import { BIO_MAX, CITIES, LEVELS, SECTIONS } from '@/data/profileOptions'
import { getInitials } from '@/lib/people'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getProfile, updateName, updateProfile } from '@/services/user'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import Mascot from '../../components/Mascot.jsx'
import { ErrorState } from '../../components/MascotMessage.jsx'
import Field from '../auth/Field.jsx'

const PROFILE_KEYS = ['level', 'section', 'school', 'city', 'bio']
const FIRST_SAVE_KEY = 'tooli-profile-saved-once'

// The very first save gets a little celebration; later ones a simple toast
function celebrateSave() {
  let first = false
  try {
    first = !localStorage.getItem(FIRST_SAVE_KEY)
    localStorage.setItem(FIRST_SAVE_KEY, '1')
  } catch {
    // storage blocked: just show the normal toast
  }
  if (first) {
    toast(i18n.t('settings.profile.firstSave'), {
      description: i18n.t('settings.profile.firstSaveText'),
      icon: <Mascot pose="celebrating" size={30} title="" aria-hidden="true" animated={false} />,
    })
  } else {
    toast.success(i18n.t('settings.profile.saved'))
  }
}

function validate(form, t) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = t('auth.errors.firstName')
  if (!form.lastName.trim()) errors.lastName = t('auth.errors.lastName')
  if (form.bio.length > BIO_MAX) errors.bio = t('settings.profile.bioTooLong', { count: BIO_MAX })
  return errors
}

// options = ids; `labels` = translation group (levels, sections, cities)
function SelectField({ id, label, value, options, labels, onChange }) {
  const { t } = useTranslation()
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="leading-normal font-semibold">
        {label}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-[46px] w-full rounded-lg border-[1.5px] bg-background px-3.5 text-[15px] data-[size=default]:h-[46px] dark:bg-background">
          <SelectValue placeholder={t('settings.profile.choose')} />
        </SelectTrigger>
        <SelectContent className="max-h-72 rounded-xl border border-border ring-0">
          {options.map((o) => (
            <SelectItem key={o} value={o} className="py-2 text-sm">
              {t(`${labels}.${o}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ProfileForm({ profile, user, updateUser }) {
  const { t } = useTranslation()
  const initial = { firstName: user.firstName ?? '', lastName: user.lastName ?? '', ...profile }
  const [saved, setSaved] = useState(initial)
  const [form, setForm] = useState(initial)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const errors = validate(form, t)
  const errorFor = (name) => (touched[name] || submitted ? errors[name] : undefined)
  const dirty = Object.keys(form).some((k) => form[k] !== saved[k])
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e?.target ? e.target.value : e }))
  const field = (name) => ({
    id: `profile-${name}`,
    value: form[name],
    error: errorFor(name),
    onChange: set(name),
    onBlur: () => setTouched((current) => ({ ...current, [name]: true })),
  })

  const save = async (e) => {
    e.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length) return
    setSaving(true)
    try {
      if (form.firstName !== saved.firstName || form.lastName !== saved.lastName) {
        const names = await updateName({ firstName: form.firstName, lastName: form.lastName })
        updateUser(names) // greeting + avatar change everywhere at once
      }
      const changes = Object.fromEntries(PROFILE_KEYS.filter((k) => form[k] !== saved[k]).map((k) => [k, form[k].trim?.() ?? form[k]]))
      const nextProfile = Object.keys(changes).length ? await updateProfile(changes) : profile
      const next = { ...form, firstName: form.firstName.trim(), lastName: form.lastName.trim(), ...nextProfile }
      setSaved(next)
      setForm(next)
      setSubmitted(false)
      setTouched({})
      celebrateSave()
    } catch (err) {
      toast.error(t('settings.profile.saveError'), { description: err.message })
    } finally {
      setSaving(false)
    }
  }

  const initials = getInitials({ firstName: form.firstName, lastName: form.lastName }) || '?'

  return (
    <form onSubmit={save} noValidate>
      <Card className="gap-6 p-6">
        <div className="flex items-center gap-4">
          <span
            className="grid size-16 shrink-0 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground"
            aria-hidden="true"
          >
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-lg font-bold">{`${form.firstName} ${form.lastName}`.trim() || t('settings.profile.yourName')}</p>
            <p className="truncate text-sm text-muted-foreground">{t('settings.profile.avatar')}</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={t('auth.firstName')} autoComplete="given-name" {...field('firstName')} />
          <Field label={t('auth.lastName')} autoComplete="family-name" {...field('lastName')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email" className="leading-normal font-semibold">
            {t('auth.email')}
          </Label>
          <Input
            id="profile-email"
            value={user.email}
            readOnly
            aria-describedby="profile-email-hint"
            className="h-[46px] rounded-lg border-[1.5px] bg-muted px-3.5 text-[15px] text-muted-foreground md:text-[15px] dark:bg-muted"
          />
          <p id="profile-email-hint" className="text-[13px] text-muted-foreground">
            {t('settings.profile.emailHint')}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            id="profile-level"
            label={t('filters.level')}
            value={form.level}
            options={LEVELS}
            labels="levels"
            onChange={set('level')}
          />
          <SelectField
            id="profile-section"
            label={t('settings.profile.section')}
            value={form.section}
            options={SECTIONS}
            labels="sections"
            onChange={set('section')}
          />
          <Field label={t('settings.profile.school')} autoComplete="organization" {...field('school')} />
          <SelectField
            id="profile-city"
            label={t('filters.city')}
            value={form.city}
            options={CITIES}
            labels="cities"
            onChange={set('city')}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-bio" className="leading-normal font-semibold">
            {t('settings.profile.bio')} <span className="font-normal text-muted-foreground">{t('settings.profile.optional')}</span>
          </Label>
          <textarea
            id="profile-bio"
            rows={3}
            value={form.bio}
            onChange={set('bio')}
            maxLength={BIO_MAX}
            placeholder={t('settings.profile.bioPlaceholder')}
            aria-describedby="profile-bio-count"
            className="min-h-[96px] resize-y rounded-lg border-[1.5px] border-input bg-background px-3.5 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-accent"
          />
          <p
            id="profile-bio-count"
            className={cn('text-end text-[13px] tabular-nums text-muted-foreground', form.bio.length >= BIO_MAX && 'font-semibold text-destructive')}
            aria-live="polite"
          >
            {form.bio.length} / {BIO_MAX}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          {dirty && (
            <Button type="button" variant="ghost" onClick={() => setForm(saved)} disabled={saving}>
              {t('settings.profile.discard')}
            </Button>
          )}
          <Button type="submit" disabled={!dirty || saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" /> {t('common.saving')}
              </>
            ) : (
              t('settings.profile.save')
            )}
          </Button>
        </div>
      </Card>
    </form>
  )
}

export default function ProfileTab() {
  const { t } = useTranslation()
  const { user, updateUser } = useAuth()
  const { data: profile, error, loading, reload } = useAsync(getProfile, [])

  if (loading && !profile) {
    return (
      <Card className="gap-5 p-6" role="status" aria-label={t('settings.profile.loading')}>
        <Skeleton className="size-16 rounded-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[72px] rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-24 rounded-lg" />
      </Card>
    )
  }
  if (error) return <ErrorState onRetry={reload} />
  return <ProfileForm profile={profile} user={user} updateUser={updateUser} />
}

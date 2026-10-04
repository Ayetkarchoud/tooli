// Settings → Profile: name (updates the session too, so the greeting and avatar change), read-only email,
// level / section / school / city / bio from services/user.js. "Save changes" only when something changed.

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { ErrorState } from '../../components/MascotMessage.jsx'
import Field from '../auth/Field.jsx'

const PROFILE_KEYS = ['level', 'section', 'school', 'city', 'bio']

function validate(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'What should we call you?'
  if (!form.lastName.trim()) errors.lastName = 'Please add your last name too.'
  if (form.bio.length > BIO_MAX) errors.bio = `Keep it under ${BIO_MAX} characters.`
  return errors
}

function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="leading-normal font-semibold">
        {label}
      </Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger id={id} className="h-[46px] w-full rounded-lg border-[1.5px] bg-background px-3.5 text-[15px] data-[size=default]:h-[46px] dark:bg-background">
          <SelectValue placeholder="Choose…" />
        </SelectTrigger>
        <SelectContent className="max-h-72 rounded-xl border border-border ring-0">
          {options.map((o) => (
            <SelectItem key={o} value={o} className="py-2 text-sm">
              {o}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function ProfileForm({ profile, user, updateUser }) {
  const initial = { firstName: user.firstName ?? '', lastName: user.lastName ?? '', ...profile }
  const [saved, setSaved] = useState(initial)
  const [form, setForm] = useState(initial)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [saving, setSaving] = useState(false)

  const errors = validate(form)
  const errorFor = (name) => (touched[name] || submitted ? errors[name] : undefined)
  const dirty = Object.keys(form).some((k) => form[k] !== saved[k])
  const set = (name) => (e) => setForm((f) => ({ ...f, [name]: e?.target ? e.target.value : e }))
  const field = (name) => ({
    id: `profile-${name}`,
    value: form[name],
    error: errorFor(name),
    onChange: set(name),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
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
      toast.success('Profile saved')
    } catch (err) {
      toast.error('Your changes weren’t saved', { description: err.message })
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
            <p className="truncate text-lg font-bold">{`${form.firstName} ${form.lastName}`.trim() || 'Your name'}</p>
            <p className="truncate text-sm text-muted-foreground">Your avatar shows your initials.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name" autoComplete="given-name" {...field('firstName')} />
          <Field label="Last name" autoComplete="family-name" {...field('lastName')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-email" className="leading-normal font-semibold">
            Email
          </Label>
          <Input
            id="profile-email"
            value={user.email}
            readOnly
            aria-describedby="profile-email-hint"
            className="h-[46px] rounded-lg border-[1.5px] bg-muted px-3.5 text-[15px] text-muted-foreground md:text-[15px] dark:bg-muted"
          />
          <p id="profile-email-hint" className="text-[13px] text-muted-foreground">
            Your login email can’t be changed here yet.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField id="profile-level" label="Level" value={form.level} options={LEVELS} onChange={set('level')} />
          <SelectField id="profile-section" label="Section" value={form.section} options={SECTIONS} onChange={set('section')} />
          <Field label="School" autoComplete="organization" {...field('school')} />
          <SelectField id="profile-city" label="City" value={form.city} options={CITIES} onChange={set('city')} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="profile-bio" className="leading-normal font-semibold">
            Short bio <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <textarea
            id="profile-bio"
            rows={3}
            value={form.bio}
            onChange={set('bio')}
            maxLength={BIO_MAX}
            placeholder="What are you studying for? What do you love learning?"
            aria-describedby="profile-bio-count"
            className="min-h-[96px] resize-y rounded-lg border-[1.5px] border-input bg-background px-3.5 py-3 text-[15px] outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-accent"
          />
          <p
            id="profile-bio-count"
            className={cn('text-right text-[13px] tabular-nums text-muted-foreground', form.bio.length >= BIO_MAX && 'font-semibold text-destructive')}
            aria-live="polite"
          >
            {form.bio.length} / {BIO_MAX}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-5">
          {dirty && (
            <Button type="button" variant="ghost" onClick={() => setForm(saved)} disabled={saving}>
              Discard
            </Button>
          )}
          <Button type="submit" disabled={!dirty || saving}>
            {saving ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" /> Saving…
              </>
            ) : (
              'Save changes'
            )}
          </Button>
        </div>
      </Card>
    </form>
  )
}

export default function ProfileTab() {
  const { user, updateUser } = useAuth()
  const { data: profile, error, loading, reload } = useAsync(getProfile, [])

  if (loading && !profile) {
    return (
      <Card className="gap-5 p-6" role="status" aria-label="Loading your profile">
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

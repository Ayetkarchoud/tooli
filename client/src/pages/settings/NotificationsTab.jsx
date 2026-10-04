// Settings → Notifications: one switch per kind of message. Each change saves at once (small toast);
// if saving fails, the switch goes back and a toast explains.

import { useState } from 'react'
import { toast } from 'sonner'
import { useAsync } from '@/lib/useAsync'
import { getNotificationSettings, updateNotificationSettings } from '@/services/user'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ErrorState } from '../../components/MascotMessage.jsx'

const SETTINGS = [
  { key: 'courseReminders', label: 'Course reminders', text: 'A nudge when you haven’t opened a course you started for a few days.' },
  { key: 'bookingUpdates', label: 'Class bookings', text: 'Confirmations, reminders and changes for your classes with professors.' },
  { key: 'dailyTip', label: 'Tip of the day', text: 'One short study tip every morning.' },
  { key: 'productNews', label: 'tooli news', text: 'New features, new partner courses and special offers (about once a month).' },
]

function SettingsList({ initial }) {
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(null) // key being saved

  const toggle = async (key, label, on) => {
    setValues((v) => ({ ...v, [key]: on }))
    setSaving(key)
    try {
      await updateNotificationSettings({ [key]: on })
      toast.success(`${label} ${on ? 'on' : 'off'}`)
    } catch {
      setValues((v) => ({ ...v, [key]: !on }))
      toast.error('That change wasn’t saved', { description: 'Check your connection and try again.' })
    } finally {
      setSaving(null)
    }
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {SETTINGS.map(({ key, label, text }) => (
        <li key={key} className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
          <div className="min-w-0">
            <Label htmlFor={`notif-${key}`} className="text-[15px] leading-normal font-semibold">
              {label}
            </Label>
            <p id={`notif-${key}-text`} className="mt-0.5 text-sm text-muted-foreground">
              {text}
            </p>
          </div>
          <Switch
            id={`notif-${key}`}
            checked={values[key]}
            onCheckedChange={(on) => toggle(key, label, on)}
            disabled={saving === key}
            aria-describedby={`notif-${key}-text`}
            className="data-[size=default]:h-6 data-[size=default]:w-11 [&>span]:size-5! [&>span]:data-checked:translate-x-[calc(100%-2px)]!"
          />
        </li>
      ))}
    </ul>
  )
}

export default function NotificationsTab() {
  const { data, error, loading, reload } = useAsync(getNotificationSettings, [])

  return (
    <Card className="gap-5 p-6">
      <div>
        <h2 className="text-lg font-bold">What we send you</h2>
        <p className="text-sm text-muted-foreground">Changes are saved straight away.</p>
      </div>
      {loading && !data ? (
        <div className="flex flex-col gap-4" role="status" aria-label="Loading your notification settings">
          {SETTINGS.map((s) => (
            <Skeleton key={s.key} className="h-14 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorState onRetry={reload} />
      ) : (
        <SettingsList initial={data} />
      )}
    </Card>
  )
}

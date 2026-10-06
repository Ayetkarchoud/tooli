// Settings → Notifications: one switch per kind of message. Each change saves at once (small toast);
// if saving fails, the switch goes back and a toast explains.

import { useState } from 'react'
import { toast } from 'sonner'
import { useTranslation } from 'react-i18next'
import { useAsync } from '@/lib/useAsync'
import { getNotificationSettings, updateNotificationSettings } from '@/services/user'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import { ErrorState } from '../../components/MascotMessage.jsx'

// Texts: settings.notifications.items.<key>.label / .text
const SETTINGS = ['courseReminders', 'bookingUpdates', 'dailyTip', 'productNews']

function SettingsList({ initial }) {
  const { t } = useTranslation()
  const [values, setValues] = useState(initial)
  const [saving, setSaving] = useState(null) // key being saved

  const toggle = async (key, label, on) => {
    setValues((v) => ({ ...v, [key]: on }))
    setSaving(key)
    try {
      await updateNotificationSettings({ [key]: on })
      toast.success(t(on ? 'settings.notifications.on' : 'settings.notifications.off', { label }))
    } catch {
      setValues((v) => ({ ...v, [key]: !on }))
      toast.error(t('settings.notifications.saveError'), { description: t('tutor.sendErrorText') })
    } finally {
      setSaving(null)
    }
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {SETTINGS.map((key) => {
        const label = t(`settings.notifications.items.${key}.label`)
        return (
          <li key={key} className="flex items-center justify-between gap-6 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <Label htmlFor={`notif-${key}`} className="text-[15px] leading-normal font-semibold">
                {label}
              </Label>
              <p id={`notif-${key}-text`} className="mt-0.5 text-sm text-muted-foreground">
                {t(`settings.notifications.items.${key}.text`)}
              </p>
            </div>
            <Switch
              id={`notif-${key}`}
              checked={values[key]}
              onCheckedChange={(on) => toggle(key, label, on)}
              disabled={saving === key}
              aria-describedby={`notif-${key}-text`}
              className="data-[size=default]:h-6 data-[size=default]:w-11 [&>span]:size-5! [&>span]:data-checked:translate-x-[calc(100%-2px)]! rtl:[&>span]:data-checked:-translate-x-[calc(100%-2px)]!"
            />
          </li>
        )
      })}
    </ul>
  )
}

export default function NotificationsTab() {
  const { t } = useTranslation()
  const { data, error, loading, reload } = useAsync(getNotificationSettings, [])

  return (
    <Card className="gap-5 p-6">
      <div>
        <h2 className="text-lg font-bold">{t('settings.notifications.title')}</h2>
        <p className="text-sm text-muted-foreground">{t('settings.notifications.text')}</p>
      </div>
      {loading && !data ? (
        <div className="flex flex-col gap-4" role="status" aria-label={t('settings.notifications.loading')}>
          {SETTINGS.map((s) => (
            <Skeleton key={s} className="h-14 rounded-lg" />
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

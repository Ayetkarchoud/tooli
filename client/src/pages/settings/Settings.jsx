// Settings: Profile / Appearance & language / Notifications. Each tab has its own URL (/dashboard/settings/:tab);
// an unknown tab redirects to Profile.

import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bell, Palette, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Page from '../../components/Page.jsx'
import AppearanceTab from './AppearanceTab.jsx'
import NotificationsTab from './NotificationsTab.jsx'
import ProfileTab from './ProfileTab.jsx'
import PageHeader from '../../components/PageHeader.jsx'

// Labels: settings.tabs.<id>
const TABS = [
  { id: 'profile', icon: UserRound, Component: ProfileTab },
  { id: 'appearance', icon: Palette, Component: AppearanceTab },
  { id: 'notifications', icon: Bell, Component: NotificationsTab },
]

export default function Settings() {
  const { t } = useTranslation()
  const { tab } = useParams()
  const navigate = useNavigate()
  const current = TABS.find((item) => item.id === tab)

  if (!current) return <Navigate to="/dashboard/settings/profile" replace />

  return (
    <Page width="narrow">
      <PageHeader title={t('nav.settings')} subtitle={t('settings.subtitle')} className="mb-6" />

      <Tabs value={current.id} onValueChange={(id) => navigate(`/dashboard/settings/${id}`)}>
        <TabsList className="mb-6 grid h-auto w-full group-data-horizontal/tabs:h-auto grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1.5 sm:inline-flex sm:w-fit">
          {TABS.map(({ id, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="h-auto min-w-0 flex-none gap-2 rounded-xl px-2 py-2 leading-tight whitespace-normal max-xs:[&_svg]:hidden sm:px-4 text-sm font-semibold text-muted-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              <Icon size={16} aria-hidden="true" />
              <span>{t(`settings.tabs.${id}`)}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ id, Component }) => (
          <TabsContent key={id} value={id}>
            {id === current.id && <Component />}
          </TabsContent>
        ))}
      </Tabs>
    </Page>
  )
}

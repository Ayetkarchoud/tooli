// Settings: Profile / Appearance / Notifications. Each tab has its own URL (/dashboard/settings/:tab);
// an unknown tab redirects to Profile.

import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Bell, Palette, UserRound } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Page from '../../components/Page.jsx'
import AppearanceTab from './AppearanceTab.jsx'
import NotificationsTab from './NotificationsTab.jsx'
import ProfileTab from './ProfileTab.jsx'
import PageHeader from '../../components/PageHeader.jsx'

const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound, Component: ProfileTab },
  { id: 'appearance', label: 'Appearance', icon: Palette, Component: AppearanceTab },
  { id: 'notifications', label: 'Notifications', icon: Bell, Component: NotificationsTab },
]

export default function Settings() {
  const { tab } = useParams()
  const navigate = useNavigate()
  const current = TABS.find((t) => t.id === tab)

  if (!current) return <Navigate to="/dashboard/settings/profile" replace />

  return (
    <Page width="narrow">
      <PageHeader title="Settings" subtitle="Your profile, how tooli looks, and what we send you." className="mb-6" />

      <Tabs value={current.id} onValueChange={(id) => navigate(`/dashboard/settings/${id}`)}>
        <TabsList className="mb-6 grid h-auto w-full grid-cols-3 gap-1 rounded-2xl border border-border bg-card p-1.5 sm:inline-flex sm:w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              className="h-auto min-w-0 flex-none gap-2 rounded-xl px-2 py-2 max-xs:[&_svg]:hidden sm:px-4 text-sm font-semibold text-muted-foreground hover:text-foreground data-active:bg-primary data-active:text-primary-foreground dark:data-active:border-transparent dark:data-active:bg-primary dark:data-active:text-primary-foreground"
            >
              <Icon size={16} aria-hidden="true" /> {label}
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

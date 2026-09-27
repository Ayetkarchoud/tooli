import { NavLink, useParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NotFoundState } from '../../components/MascotMessage.jsx'
import Page from '../../components/Page.jsx'

const TABS = [
  { id: 'profile', label: 'Profile', text: 'Your name, level, school and city.' },
  { id: 'appearance', label: 'Appearance', text: 'Light or dark mode and your colour palette.' },
  { id: 'notifications', label: 'Notifications', text: 'Choose which reminders and news you receive.' },
]

// PLACEHOLDER: tab content is built in the next step. /dashboard/settings redirects to …/profile.
export default function Settings() {
  const { tab } = useParams()
  const current = TABS.find((t) => t.id === tab)

  if (!current) {
    return (
      <Page>
        <NotFoundState title="Settings page not found" backTo="/dashboard/settings/profile" backLabel="Open my settings" />
      </Page>
    )
  }

  return (
    <Page as="section">
      <h1 className="mb-4 text-[2em] leading-tight font-bold">Settings</h1>
      <nav className="mb-6 flex flex-wrap gap-2" aria-label="Settings sections">
        {TABS.map((t) => (
          <NavLink
            key={t.id}
            to={`/dashboard/settings/${t.id}`}
            className={({ isActive }) =>
              cn(
                'rounded-full border border-border px-4 py-1.5 text-sm font-semibold no-underline hover:bg-accent',
                isActive && 'border-primary bg-accent',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <h2 className="text-lg font-semibold">{current.label}</h2>
      <p className="text-muted-foreground">{current.text}</p>
    </Page>
  )
}

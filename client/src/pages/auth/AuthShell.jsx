// Shared frame for /login and /signup: back link, theme switcher, centered card with logo + mascot.

import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '@/components/ui/card'
import Logo from '../../components/Logo.jsx'
import Mascot from '../../components/Mascot.jsx'
import ThemeSwitcher from '../../components/ThemeSwitcher.jsx'

export default function AuthShell({ pose, mascotTitle, title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col [background:radial-gradient(circle_at_12%_0%,var(--color-primary-soft),transparent_42%),radial-gradient(circle_at_100%_100%,var(--color-accent-soft),transparent_38%),var(--color-bg)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 max-xs:px-4 max-xs:py-3">
        <Link
          to="/"
          className="-ml-2.5 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-semibold text-foreground no-underline hover:bg-accent"
        >
          <ArrowLeft size={16} aria-hidden="true" /> Back to home
        </Link>
        <ThemeSwitcher />
      </div>

      <main className="grid flex-1 place-items-center px-4 pt-2 pb-12">
        <Card className="w-full max-w-[440px] gap-0 p-8 text-base shadow-[0_24px_48px_-32px_color-mix(in_srgb,var(--color-text)_45%,transparent)] max-xs:px-5 max-xs:py-6">
          <div className="mb-[18px] flex items-center justify-between">
            <Link to="/" aria-label="tooli home" className="inline-flex rounded-md">
              <Logo height={34} />
            </Link>
            <Mascot pose={pose} size={76} title={mascotTitle} />
          </div>

          <h1 className="text-[26px] font-extrabold">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>

          {children}

          <p className="mt-[22px] text-center text-sm text-muted-foreground [&_a]:font-semibold [&_a]:text-primary-text [&_a]:underline">
            {footer}
          </p>
        </Card>
      </main>
    </div>
  )
}

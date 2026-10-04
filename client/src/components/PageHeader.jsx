// The same page header everywhere in the member area: title, one-line subtitle,
// optional badge (next to the title), optional actions (right) and an optional mascot.
//   <PageHeader title="Partner courses" subtitle="…" mascot="explaining" actions={<Button…/>} />

import { cn } from '@/lib/utils'
import Mascot from './Mascot.jsx'

export const PAGE_TITLE = 'text-[clamp(26px,3.4vw,34px)] leading-tight font-extrabold tracking-[-0.01em]'

export default function PageHeader({ title, subtitle, badge, actions, mascot, className }) {
  return (
    <header className={cn('mb-8 flex items-center justify-between gap-6', className)}>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className={PAGE_TITLE}>{title}</h1>
          {badge}
        </div>
        {subtitle && <p className="mt-1.5 max-w-2xl text-muted-foreground">{subtitle}</p>}
      </div>
      {(actions || mascot) && (
        <div className="flex shrink-0 items-center gap-3">
          {actions}
          {mascot && <Mascot pose={mascot} size={84} title="" aria-hidden="true" className="max-sm:hidden" />}
        </div>
      )}
    </header>
  )
}

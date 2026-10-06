import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

// One labelled row of filter chips ("All" + options). Scrolls sideways on phones.
// options: [{ value, label }], value: current value ('' = All)
export default function ChipGroup({ label, options, value, onChange }) {
  const { t } = useTranslation()
  const id = `chips-${label.replace(/\s+/g, '-')}`
  return (
    <div className="flex min-w-0 items-center gap-3 max-md:flex-col max-md:items-stretch max-md:gap-1.5">
      <span className="w-20 shrink-0 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase" id={id}>
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={id}
        className="-mx-4 flex min-w-0 gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        {[{ value: '', label: t('common.all') }, ...options].map((o) => {
          const active = value === o.value
          return (
            <button
              key={o.value || 'all'}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(o.value)}
              className={cn(
                'shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:border-primary hover:bg-accent',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

import { cn } from '@/lib/utils'

// One labelled row of filter chips ("All" + options). Scrolls sideways on phones.
// options: [{ value, label }], value: current value ('' = All)
export default function ChipGroup({ label, options, value, onChange }) {
  return (
    <div className="flex items-center gap-3 max-md:flex-col max-md:items-start max-md:gap-1.5">
      <span className="w-20 shrink-0 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase" id={`chips-${label}`}>
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={`chips-${label}`}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:overflow-visible md:px-0 md:pb-0"
      >
        {[{ value: '', label: 'All' }, ...options].map((o) => {
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

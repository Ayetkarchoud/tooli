// Settings → Appearance: the 5 palettes as live previews + Light / Dark / System. Applies instantly.
// Each preview sets data-palette on its own box, so it shows real tooli parts in that palette
// (tokens.css recomputes the palette tokens on any [data-palette] element).

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import Mascot from '../../components/Mascot.jsx'
import { PALETTES, useTheme } from '../../theme/themeContext.js'

const MODES = [
  { id: 'light', label: 'Light', text: 'Bright and clear', icon: Sun },
  { id: 'dark', label: 'Dark', text: 'Easy on the eyes at night', icon: Moon },
  { id: 'system', label: 'System', text: 'Follows your device', icon: Monitor },
]

// A radio input styled as a card (native radios: arrow keys move between options)
function OptionCard({ name, value, checked, onChange, className, children }) {
  return (
    <label
      className={cn(
        'relative flex cursor-pointer flex-col rounded-2xl border-2 border-border bg-card transition-[border-color,box-shadow]',
        'hover:border-primary has-checked:border-primary has-checked:shadow-lift',
        'has-focus-visible:ring-3 has-focus-visible:ring-ring/50',
        className,
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {checked && (
        <span className="absolute top-2.5 right-2.5 z-10 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      {children}
    </label>
  )
}

export default function AppearanceTab() {
  const { palette, setPalette, themeChoice, setThemeChoice } = useTheme()

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-5 p-6">
        <fieldset>
          <legend className="mb-1 text-lg font-bold">Colour palette</legend>
          <p className="mb-5 text-sm text-muted-foreground">Pick the colour you like: buttons, links and the mascot follow it.</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {PALETTES.map((p) => (
              <OptionCard key={p.id} name="palette" value={p.id} checked={palette === p.id} onChange={() => setPalette(p.id)} className="overflow-hidden">
                {/* the preview, drawn in this palette */}
                <div data-palette={p.id} className="flex flex-col items-center gap-2 bg-background px-3 pt-4 pb-3" aria-hidden="true">
                  <Mascot pose="waving" size={58} title="" animated={false} />
                  <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">Start</span>
                  <span className="text-xs font-semibold text-primary-text">tooli</span>
                </div>
                <span className="border-t border-border px-3 py-2.5 text-center text-sm font-semibold">{p.label}</span>
              </OptionCard>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="gap-5 p-6">
        <fieldset>
          <legend className="mb-1 text-lg font-bold">Light or dark</legend>
          <p className="mb-5 text-sm text-muted-foreground">System switches by itself when your phone or computer does.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODES.map(({ id, label, text, icon: Icon }) => (
              <OptionCard key={id} name="theme" value={id} checked={themeChoice === id} onChange={() => setThemeChoice(id)} className="flex-row items-center gap-3 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary-text" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-semibold">{label}</span>
                  <span className="block text-sm text-muted-foreground">{text}</span>
                </span>
              </OptionCard>
            ))}
          </div>
        </fieldset>
      </Card>
    </div>
  )
}

// Settings → Appearance & language: the 5 palettes as live previews, Light / Dark / System, and the language
// (English, Français, العربية). Everything applies instantly; the language is also saved in the profile.
// Each preview sets data-palette on its own box, so it shows real tooli parts in that palette
// (tokens.css recomputes the palette tokens on any [data-palette] element).

import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LANGUAGES } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { useChangeLanguage } from '@/lib/useChangeLanguage'
import Mascot from '../../components/Mascot.jsx'
import { PALETTES, useTheme } from '../../theme/themeContext.js'

// Texts: settings.appearance.modes.<id>.label / .text
const MODES = [
  { id: 'light', icon: Sun },
  { id: 'dark', icon: Moon },
  { id: 'system', icon: Monitor },
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
        <span className="absolute end-2.5 top-2.5 z-10 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground" aria-hidden="true">
          <Check size={14} strokeWidth={3} />
        </span>
      )}
      {children}
    </label>
  )
}

export default function AppearanceTab() {
  const { t, i18n } = useTranslation()
  const { palette, setPalette, themeChoice, setThemeChoice } = useTheme()
  const changeLanguage = useChangeLanguage()

  return (
    <div className="flex flex-col gap-6">
      <Card className="gap-5 p-6">
        <fieldset>
          <legend className="mb-1 text-lg font-bold">{t('language.title')}</legend>
          <p className="mb-5 text-sm text-muted-foreground">{t('settings.language.text')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {LANGUAGES.map((l) => (
              <OptionCard
                key={l.code}
                name="language"
                value={l.code}
                checked={i18n.resolvedLanguage === l.code}
                onChange={() => changeLanguage(l.code)}
                className="flex-row items-center gap-3 p-4"
              >
                <span
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-sm font-bold text-primary-text uppercase"
                  aria-hidden="true"
                >
                  {l.code}
                </span>
                <span className="min-w-0">
                  <span className="block font-semibold" lang={l.code} dir={l.dir}>
                    {l.name}
                  </span>
                  {/* the name in the current language, when it differs ("Arabe" under "العربية") */}
                  {t(`languageNames.${l.code}`) !== l.name && (
                    <span className="block text-sm text-muted-foreground">{t(`languageNames.${l.code}`)}</span>
                  )}
                </span>
              </OptionCard>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="gap-5 p-6">
        <fieldset>
          <legend className="mb-1 text-lg font-bold">{t('settings.appearance.palette')}</legend>
          <p className="mb-5 text-sm text-muted-foreground">{t('settings.appearance.paletteText')}</p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {PALETTES.map((p) => (
              <OptionCard key={p.id} name="palette" value={p.id} checked={palette === p.id} onChange={() => setPalette(p.id)} className="overflow-hidden">
                {/* the preview, drawn in this palette */}
                <div data-palette={p.id} className="flex flex-col items-center gap-2 bg-background px-3 pt-4 pb-3" aria-hidden="true">
                  <Mascot pose="waving" size={58} title="" animated={false} />
                  <span className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t('settings.appearance.previewButton')}</span>
                  <span className="text-xs font-semibold text-primary-text">tooli</span>
                </div>
                <span className="border-t border-border px-3 py-2.5 text-center text-sm font-semibold">{t(`theme.palettes.${p.id}`)}</span>
              </OptionCard>
            ))}
          </div>
        </fieldset>
      </Card>

      <Card className="gap-5 p-6">
        <fieldset>
          <legend className="mb-1 text-lg font-bold">{t('settings.appearance.mode')}</legend>
          <p className="mb-5 text-sm text-muted-foreground">{t('settings.appearance.modeText')}</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {MODES.map(({ id, icon: Icon }) => (
              <OptionCard key={id} name="theme" value={id} checked={themeChoice === id} onChange={() => setThemeChoice(id)} className="flex-row items-center gap-3 p-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-accent text-primary-text" aria-hidden="true">
                  <Icon size={20} />
                </span>
                <span>
                  <span className="block font-semibold">{t(`settings.appearance.modes.${id}.label`)}</span>
                  <span className="block text-sm text-muted-foreground">{t(`settings.appearance.modes.${id}.text`)}</span>
                </span>
              </OptionCard>
            ))}
          </div>
        </fieldset>
      </Card>
    </div>
  )
}

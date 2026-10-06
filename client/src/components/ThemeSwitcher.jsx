import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PALETTES, useTheme } from '../theme/themeContext.js'

// Palette swatches + light/dark toggle.
// Swatches carry aria-pressed, so a parent can resize them: [&_[aria-pressed]]:size-5
export default function ThemeSwitcher({ className }) {
  const { t } = useTranslation()
  const { theme, toggleTheme, palette, setPalette } = useTheme()
  const modeLabel = theme === 'dark' ? t('theme.toLight') : t('theme.toDark')

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {PALETTES.map((p) => (
        <Tooltip key={p.id}>
          <TooltipTrigger asChild>
            <button
              type="button"
              className={cn(
                'size-[22px] rounded-full border-2 border-card p-0 shadow-[0_0_0_1px_var(--color-border)]',
                palette === p.id && 'shadow-[0_0_0_2px_var(--color-text)]',
              )}
              style={{ background: p.swatch }}
              onClick={() => setPalette(p.id)}
              aria-label={t('theme.paletteLabel', { name: t(`theme.palettes.${p.id}`) })}
              aria-pressed={palette === p.id}
            />
          </TooltipTrigger>
          <TooltipContent>{t(`theme.palettes.${p.id}`)}</TooltipContent>
        </Tooltip>
      ))}

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="ms-1 grid size-9 place-items-center rounded-md border border-border bg-background text-base hover:bg-accent"
            onClick={toggleTheme}
            aria-label={modeLabel}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </TooltipTrigger>
        <TooltipContent>{modeLabel}</TooltipContent>
      </Tooltip>
    </div>
  )
}

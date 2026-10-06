// Language choice: English, Français, العربية (each written in its own language).
//   <LanguageSwitcher />        🌐 FR button + small menu (landing header, login/signup)
//   <LanguageRadioItems />      the same 3 choices inside another dropdown (avatar menu → Language)
// Both switch through useChangeLanguage() (src/lib/useChangeLanguage.js).

import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/lib/i18n'
import { useChangeLanguage } from '@/lib/useChangeLanguage'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

// lang/dir on each name, so screen readers and the browser read "العربية" as Arabic
export function LanguageRadioItems({ itemClassName }) {
  const { i18n } = useTranslation()
  const changeLanguage = useChangeLanguage()

  return (
    <DropdownMenuRadioGroup value={i18n.resolvedLanguage} onValueChange={changeLanguage}>
      {LANGUAGES.map((l) => (
        <DropdownMenuRadioItem key={l.code} value={l.code} className={itemClassName}>
          <span lang={l.code} dir={l.dir}>
            {l.name}
          </span>
        </DropdownMenuRadioItem>
      ))}
    </DropdownMenuRadioGroup>
  )
}

export default function LanguageSwitcher({ className, align = 'end' }) {
  const { t, i18n } = useTranslation()
  const current = LANGUAGES.find((l) => l.code === i18n.resolvedLanguage) ?? LANGUAGES[1]
  const label = t('language.choose', { language: current.name })

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label={label}
              className={cn(
                'inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-semibold hover:bg-accent data-[state=open]:bg-accent',
                className,
              )}
            >
              <span aria-hidden="true">🌐</span>
              <span className="uppercase">{current.code}</span>
            </button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('language.title')}</TooltipContent>
      </Tooltip>
      <DropdownMenuContent align={align} sideOffset={6} className="w-44 rounded-xl p-1.5">
        <DropdownMenuLabel>{t('language.title')}</DropdownMenuLabel>
        <LanguageRadioItems itemClassName="rounded-md py-2 text-sm font-semibold" />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

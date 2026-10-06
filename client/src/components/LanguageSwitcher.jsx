// Language choice: English, Français, العربية (each written in its own language).
//   <LanguageSwitcher />        🌐 FR button + small menu (landing header, login/signup)
//   <LanguageRadioItems />      the same 3 choices inside another dropdown (avatar menu → Language)
//   useChangeLanguage()         what both use: switches at once (Arabic → right-to-left),
//                               remembers it in the browser and, when logged in, in the profile.

import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { LANGUAGES } from '@/lib/i18n'
import { updateProfile } from '@/services/user'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAuth } from '../auth/authContext.js'

export function useChangeLanguage() {
  const { i18n, t } = useTranslation()
  const { isLoggedIn, updateUser } = useAuth()

  return useCallback(
    async (code) => {
      if (code === i18n.resolvedLanguage) return
      await i18n.changeLanguage(code) // also saved in localStorage ('tooli-lang') by the detector
      if (!isLoggedIn) return
      updateUser({ language: code })
      try {
        await updateProfile({ language: code })
      } catch {
        // The page is already in the new language; only the profile copy failed
        toast.error(t('settings.language.saveError'))
      }
    },
    [i18n, isLoggedIn, updateUser, t],
  )
}

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

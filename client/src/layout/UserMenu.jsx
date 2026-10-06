// Avatar button in the top bar + its small dropdown: Language (submenu), Settings, Log out.
// Keyboard, outside click and Escape are handled by the shadcn DropdownMenu.

import { Link, useNavigate } from 'react-router-dom'
import { Languages, LogOut, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '../auth/authContext.js'
import { getInitials } from '@/lib/people'
import { LANGUAGES } from '@/lib/i18n'
import { LanguageRadioItems } from '../components/LanguageSwitcher.jsx'
import { SETTINGS_NAV } from './navItems.js'

const itemClass = 'gap-2.5 rounded-md px-3 py-2.5 text-sm font-semibold [&_svg:not([class*=size-])]:size-[18px]'

export default function UserMenu() {
  const { t, i18n } = useTranslation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ')

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="shrink-0 rounded-full data-[state=open]:ring-3 data-[state=open]:ring-accent"
          aria-label={t('nav.accountMenu', { name: fullName })}
        >
          <Avatar className="size-[38px] after:hidden">
            <AvatarFallback className="bg-primary text-sm font-semibold text-primary-foreground">
              {getInitials(user)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-60 max-w-[calc(100vw-32px)] rounded-xl border border-border p-1.5 shadow-[0_18px_40px_-20px_color-mix(in_srgb,var(--color-text)_50%,transparent)] ring-0"
      >
        <DropdownMenuLabel className="flex min-w-0 flex-col gap-0.5 px-3 pt-2.5 pb-3">
          <strong className="text-sm text-foreground">{fullName}</strong>
          <span className="truncate text-xs font-normal text-muted-foreground">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="mx-0 mt-0 mb-1" />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className={itemClass}>
            <Languages aria-hidden="true" /> {t('language.title')}
            <span className="ms-auto text-xs font-normal text-muted-foreground">
              {LANGUAGES.find((l) => l.code === i18n.resolvedLanguage)?.name}
            </span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-44 rounded-xl p-1.5">
            <LanguageRadioItems itemClassName="rounded-md py-2 text-sm font-semibold" />
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuItem asChild className={itemClass}>
          <Link to={SETTINGS_NAV.to}>
            <Settings aria-hidden="true" /> {t('nav.settings')}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem className={itemClass} onSelect={handleLogout}>
          <LogOut aria-hidden="true" /> {t('nav.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

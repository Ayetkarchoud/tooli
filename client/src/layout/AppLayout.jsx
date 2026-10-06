// Member area frame: sidebar + top bar (desktop), top bar + bottom tab bar + slide-in menu (mobile).

import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { Bell, Crown, Menu, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import AnimatedOutlet from '../components/AnimatedOutlet.jsx'
import Logo from '../components/Logo.jsx'
import ThemeSwitcher from '../components/ThemeSwitcher.jsx'
import { NotificationsProvider } from './NotificationsProvider.jsx'
import UserMenu from './UserMenu.jsx'
import { useNotifications } from './notificationsContext.js'
import { MAIN_NAV, SETTINGS_NAV } from './navItems.js'

// Text stays foreground on the active link so it is readable on every palette (yellow, green…)
const navLinkClass = ({ isActive }) =>
  cn(
    'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-muted-foreground no-underline transition-colors hover:bg-background hover:text-foreground',
    isActive &&
      'bg-accent text-foreground hover:bg-accent before:absolute before:inset-y-2.5 before:start-0 before:w-1 before:rounded-e-sm before:bg-primary',
  )

const tabLinkClass = ({ isActive }) =>
  cn(
    'flex flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[11px] font-semibold text-muted-foreground no-underline',
    isActive && 'bg-accent text-foreground',
  )

// Nav + Go VIP + Settings: the desktop sidebar, and the mobile slide-in menu
function SidebarContent({ onNavigate }) {
  const { t } = useTranslation()
  const SettingsIcon = SETTINGS_NAV.icon

  return (
    <>
      <Link to="/dashboard" className="inline-flex self-start rounded-lg px-2 py-1" aria-label={t('nav.homeLink')} onClick={onNavigate}>
        <Logo height={40} />
      </Link>

      <nav className="flex flex-col gap-1" aria-label={t('nav.main')}>
        {MAIN_NAV.map(({ to, key, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={navLinkClass} onClick={onNavigate}>
            <Icon size={20} aria-hidden="true" />
            <span>{t(`nav.${key}`)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <div className="flex flex-col items-start gap-1.5 rounded-2xl border border-highlight bg-highlight-soft p-4">
          <span className="grid size-[34px] place-items-center rounded-lg bg-highlight text-highlight-foreground">
            <Crown size={18} aria-hidden="true" />
          </span>
          <strong className="text-[15px]">{t('nav.goVip')}</strong>
          <p className="text-xs leading-normal text-foreground/80">{t('nav.goVipText')}</p>
          <Button asChild variant="highlight" size="sm" className="mt-1.5 rounded-lg">
            <Link to="/dashboard/vip" onClick={onNavigate}>
              {t('nav.upgrade')}
            </Link>
          </Button>
        </div>

        <NavLink to={SETTINGS_NAV.to} className={navLinkClass} onClick={onNavigate}>
          <SettingsIcon size={20} aria-hidden="true" />
          <span>{t('nav.settings')}</span>
        </NavLink>
      </div>
    </>
  )
}

// Mobile only: menu button + slide-in panel with the full sidebar
function MobileMenu() {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <SheetTrigger asChild>
            <Button variant="tile" size="icon" className="nav:hidden" aria-label={t('nav.openMenu')}>
              <Menu size={20} aria-hidden="true" />
            </Button>
          </SheetTrigger>
        </TooltipTrigger>
        <TooltipContent>{t('nav.menu')}</TooltipContent>
      </Tooltip>

      <SheetContent
        // the menu comes from the start side: left, or right in Arabic
        side={i18n.dir(i18n.resolvedLanguage) === 'rtl' ? 'right' : 'left'}
        className="w-[280px] gap-6 bg-card px-4 py-5 outline-none"
        // Radix would focus the first button (a palette swatch) and pop its tooltip; focus the panel instead
        onOpenAutoFocus={(e) => {
          e.preventDefault()
          e.currentTarget.focus()
        }}
      >
        <SheetTitle className="sr-only">{t('nav.menu')}</SheetTitle>
        <SidebarContent onNavigate={() => setOpen(false)} />
        {/* on small phones the top bar has no room for the palette switcher, so it lives here */}
        <ThemeSwitcher className="justify-center xs:hidden" />
      </SheetContent>
    </Sheet>
  )
}

// Top-bar search: submits to /dashboard/search?q=… and shows the current query on that page
function SearchBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const urlQuery = pathname === '/dashboard/search' ? (params.get('q') ?? '') : ''
  const [value, setValue] = useState(urlQuery)
  // Follow the URL when it changes (back button, links), without an effect
  const [shownQuery, setShownQuery] = useState(urlQuery)
  if (urlQuery !== shownQuery) {
    setShownQuery(urlQuery)
    setValue(urlQuery)
  }

  const submit = (e) => {
    e.preventDefault()
    const q = value.trim()
    if (q) navigate(`/dashboard/search?q=${encodeURIComponent(q)}`)
  }

  return (
    <form
      className="relative min-w-0 max-w-[420px] flex-1 max-nav:order-3 max-nav:max-w-none max-nav:basis-full"
      role="search"
      onSubmit={submit}
    >
      <Search
        size={18}
        className="pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t('search.placeholder')}
        aria-label={t('search.label')}
        className="h-[42px] rounded-lg bg-background ps-[42px] pe-3.5 text-sm focus-visible:border-primary focus-visible:ring-accent md:text-sm dark:bg-background"
      />
    </form>
  )
}

// Bell → /dashboard/notifications. The dot shows only when something is unread.
function NotificationBell() {
  // Shared count (NotificationsProvider): marking notifications as read updates the dot instantly
  const { t } = useTranslation()
  const { unread: unreadCount } = useNotifications()
  const label = unreadCount > 0 ? t('notifications.bellUnread', { count: unreadCount }) : t('notifications.title')

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild variant="tile" size="icon" className="relative">
          <Link to="/dashboard/notifications" aria-label={label}>
            <Bell size={20} aria-hidden="true" />
            {unreadCount > 0 && (
              <span className="absolute end-[9px] top-2 size-2 rounded-full bg-highlight shadow-[0_0_0_2px_var(--color-bg)]" />
            )}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

// One page key per page, except the tutor: switching chats must not fade/remount the page
const memberPageKey = (pathname) => (pathname.startsWith('/dashboard/tutor') ? '/dashboard/tutor' : pathname)

export default function AppLayout() {
  const { t } = useTranslation()
  const rootRef = useRef(null)
  const headerRef = useRef(null)

  // Share the top bar's height as --app-header-h, for full-height pages (the tutor chat)
  useEffect(() => {
    const header = headerRef.current
    const observer = new ResizeObserver(() => {
      rootRef.current?.style.setProperty('--app-header-h', `${header.offsetHeight}px`)
    })
    observer.observe(header)
    return () => observer.disconnect()
  }, [])

  return (
    <NotificationsProvider>
      <div ref={rootRef} className="grid min-h-screen grid-cols-[240px_minmax(0,1fr)] max-nav:grid-cols-[minmax(0,1fr)]">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 flex h-screen flex-col gap-6 overflow-y-auto border-e border-border bg-card px-4 py-5 max-nav:hidden">
          <SidebarContent />
        </aside>

        <div className="flex min-w-0 flex-col">
          {/* Mobile: row 1 = menu + logo + actions, row 2 = full-width search */}
          <header ref={headerRef} className="sticky top-0 z-10 flex items-center gap-4 border-b border-border bg-card px-6 py-3 max-nav:flex-wrap max-nav:gap-x-3 max-nav:gap-y-2.5 max-nav:px-4 max-nav:py-2.5">
            <MobileMenu />
            <Link to="/dashboard" className="hidden rounded-lg max-nav:inline-flex" aria-label={t('nav.homeLink')}>
              <Logo height={28} />
            </Link>

            <SearchBar />

            <div className="ms-auto flex items-center gap-3 max-nav:gap-2">
              <ThemeSwitcher className="max-nav:gap-1.5 max-nav:[&_[aria-pressed]]:size-5 max-xs:hidden" />
              <NotificationBell />
              <UserMenu />
            </div>
          </header>

          <main className="flex-1 max-nav:pb-[calc(72px+env(safe-area-inset-bottom))]">
            <AnimatedOutlet pageKey={memberPageKey} />
          </main>
        </div>

        {/* Mobile bottom tab bar */}
        <nav
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-border bg-card px-2 pt-1.5 pb-[calc(6px+env(safe-area-inset-bottom))] nav:hidden"
          aria-label={t('nav.main')}
        >
          {MAIN_NAV.map(({ to, key, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={tabLinkClass}>
              <Icon size={22} aria-hidden="true" />
              <span className="max-w-full truncate">{t(`nav.${key}Short`)}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </NotificationsProvider>
  )
}

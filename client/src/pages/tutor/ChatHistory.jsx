// Past tutor chats: "New chat", a search box and the list (desktop panel + mobile Sheet).

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MessageSquarePlus, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { matches } from '@/lib/text'
import { timeAgo } from '@/lib/time'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Mascot from '../../components/Mascot.jsx'

export default function ChatHistory({ chats, error, onRetry, onNewChat, onNavigate }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const shown = chats?.filter((c) => !query.trim() || matches(`${c.title} ${c.lastMessage}`, query))

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Button onClick={onNewChat} className="w-full">
        <MessageSquarePlus aria-hidden="true" /> {t('tutor.newChat')}
      </Button>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('tutor.history.search')}
          aria-label={t('tutor.history.searchLabel')}
          className="h-10 rounded-lg bg-background ps-9 text-sm md:text-sm dark:bg-background"
        />
      </div>

      <h2 className="px-1 pt-1 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">{t('tutor.history.title')}</h2>

      <nav aria-label={t('tutor.history.title')} className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        {!chats && !error && (
          <div className="flex flex-col gap-2" role="status" aria-label={t('tutor.history.loading')}>
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[58px] rounded-xl" />
            ))}
          </div>
        )}

        {error && !chats && (
          <div className="flex flex-col items-start gap-2 px-1 text-sm" role="alert">
            <p className="text-muted-foreground">{t('tutor.history.error')}</p>
            <Button variant="pill" size="sm" onClick={onRetry}>
              <RefreshCw aria-hidden="true" /> {t('common.tryAgain')}
            </Button>
          </div>
        )}

        {chats?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-2 py-6 text-center text-sm text-muted-foreground">
            <Mascot pose="sleepy" size={64} title="" aria-hidden="true" />
            {t('tutor.history.empty')}
          </div>
        )}

        {chats?.length > 0 && shown.length === 0 && (
          <p className="px-1 py-4 text-sm text-muted-foreground">{t('tutor.history.noMatch', { query: query.trim() })}</p>
        )}

        {shown?.length > 0 && (
          <ul className="flex flex-col gap-1">
            {shown.map((chat) => (
              <li key={chat.id}>
                <NavLink
                  to={`/dashboard/tutor/${chat.id}`}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-xl px-3 py-2.5 text-foreground no-underline transition-colors hover:bg-background',
                      isActive && 'bg-accent hover:bg-accent',
                    )
                  }
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span dir="auto" className="truncate text-sm font-semibold">
                      {chat.title}
                    </span>
                    <time dateTime={chat.updatedAt} className="shrink-0 text-[11px] text-muted-foreground">
                      {timeAgo(chat.updatedAt)}
                    </time>
                  </span>
                  <span dir="auto" className="mt-0.5 block truncate text-start text-xs text-muted-foreground">
                    {chat.lastMessage.replace(/[*`#]/g, '')}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </div>
  )
}

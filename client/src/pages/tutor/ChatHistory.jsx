// Past tutor chats: "New chat", a search box and the list (desktop panel + mobile Sheet).

import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MessageSquarePlus, RefreshCw, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { matches } from '@/lib/text'
import { timeAgo } from '@/lib/time'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import Mascot from '../../components/Mascot.jsx'

export default function ChatHistory({ chats, error, onRetry, onNewChat, onNavigate }) {
  const [query, setQuery] = useState('')
  const shown = chats?.filter((c) => !query.trim() || matches(`${c.title} ${c.lastMessage}`, query))

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Button onClick={onNewChat} className="w-full">
        <MessageSquarePlus aria-hidden="true" /> New chat
      </Button>

      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search chats"
          aria-label="Search your chats"
          className="h-10 rounded-lg bg-background pl-9 text-sm md:text-sm dark:bg-background"
        />
      </div>

      <h2 className="px-1 pt-1 text-xs font-semibold tracking-[0.04em] text-muted-foreground uppercase">Your chats</h2>

      <nav aria-label="Your chats" className="-mx-1 min-h-0 flex-1 overflow-y-auto px-1 pb-2">
        {!chats && !error && (
          <div className="flex flex-col gap-2" role="status" aria-label="Loading your chats">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[58px] rounded-xl" />
            ))}
          </div>
        )}

        {error && !chats && (
          <div className="flex flex-col items-start gap-2 px-1 text-sm" role="alert">
            <p className="text-muted-foreground">Your chats didn’t load.</p>
            <Button variant="pill" size="sm" onClick={onRetry}>
              <RefreshCw aria-hidden="true" /> Try again
            </Button>
          </div>
        )}

        {chats?.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-2 py-6 text-center text-sm text-muted-foreground">
            <Mascot pose="sleepy" size={64} title="" aria-hidden="true" />
            No chats yet. Your questions will show up here.
          </div>
        )}

        {chats?.length > 0 && shown.length === 0 && (
          <p className="px-1 py-4 text-sm text-muted-foreground">No chat matches “{query.trim()}”.</p>
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
                    <span className="truncate text-sm font-semibold">{chat.title}</span>
                    <time dateTime={chat.updatedAt} className="shrink-0 text-[11px] text-muted-foreground">
                      {timeAgo(chat.updatedAt)}
                    </time>
                  </span>
                  <span className="mt-0.5 block truncate text-xs text-muted-foreground">
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

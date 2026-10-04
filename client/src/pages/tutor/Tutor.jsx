// AI tutor: /dashboard/tutor (new chat) and /dashboard/tutor/:chatId (one conversation).
// One route with an optional :chatId, so the page stays mounted when a new chat gets its id.
// Chat history on the left (a Sheet on mobile), conversation + composer on the right.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { ArrowDown, History, MessageSquarePlus } from 'lucide-react'
import { useAuth } from '@/auth/authContext'
import { useAsync } from '@/lib/useAsync'
import { cn } from '@/lib/utils'
import { getChat, listChats, sendMessage } from '@/services/tutor'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ErrorState, NotFoundState } from '../../components/MascotMessage.jsx'
import ChatHistory from './ChatHistory.jsx'
import Composer from './Composer.jsx'
import { SendError, ThinkingBubble, TutorMessage, UserBubble } from './Messages.jsx'
import Welcome from './Welcome.jsx'

const shortTitle = (text) => (text.length > 48 ? `${text.slice(0, 45)}…` : text)
// Focus the composer after clicking a card/button only with a mouse or keyboard,
// not on touch screens (it would pop the keyboard over the answer)
const finePointer = () => window.matchMedia('(pointer: fine)').matches

function ConversationSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6" role="status" aria-label="Loading the conversation">
      <Skeleton className="ml-auto h-11 w-2/3 rounded-2xl" />
      <div className="flex gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <Skeleton className="h-36 flex-1 rounded-2xl" />
      </div>
      <Skeleton className="ml-auto h-11 w-1/2 rounded-2xl" />
    </div>
  )
}

export default function Tutor() {
  const { chatId } = useParams()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const { user } = useAuth()
  const reduce = useReducedMotion()

  // ---------- History ----------
  const [historyVersion, setHistoryVersion] = useState(0)
  const history = useAsync(listChats, [historyVersion])
  const [historyOpen, setHistoryOpen] = useState(false)

  // ---------- Conversation ----------
  // status: 'loading' | 'ready' | 'notfound' | 'error'. Messages that just arrived carry `fresh: true` (they animate in).
  const emptyChat = { status: 'ready', title: null, messages: [] }
  const [conv, setConv] = useState(chatId ? { ...emptyChat, status: 'loading' } : emptyChat)
  const [thinking, setThinking] = useState(false)
  const [sendError, setSendError] = useState(null) // { question, questionId, message }
  const [draft, setDraft] = useState('')
  const [createdChatId, setCreatedChatId] = useState(null) // chat we just created: its messages are already here

  // The URL's chat changed (history click, new chat, back button): reset during render, not in an effect
  const [shownChatId, setShownChatId] = useState(chatId)
  if (chatId !== shownChatId) {
    setShownChatId(chatId)
    setThinking(false)
    setSendError(null)
    if (!chatId) setConv(emptyChat)
    else if (chatId === createdChatId) setCreatedChatId(null) // already on screen, just forget the flag
    else setConv({ ...emptyChat, status: 'loading' })
  }

  // Goes up whenever the conversation on screen changes (other chat, New chat). A question remembers
  // the value it was sent under, so a late answer for an abandoned question is ignored.
  const conversation = useRef(0)
  const focusTitleNext = useRef(false)
  const composerRef = useRef(null)
  const titleRef = useRef(null)

  useEffect(() => {
    conversation.current += 1
  }, [chatId])

  // Fetch the chat whenever it is marked as loading (URL change or "Try again")
  useEffect(() => {
    if (conv.status !== 'loading' || !chatId) return
    let live = true
    getChat(chatId).then(
      (chat) =>
        live &&
        setConv(chat ? { status: 'ready', title: chat.title, messages: chat.messages } : { ...emptyChat, status: 'notfound' }),
      () => live && setConv({ ...emptyChat, status: 'error' }),
    )
    return () => {
      live = false
    }
    // emptyChat is a fresh object each render; it only provides constant defaults
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, conv.status])

  // After picking a chat in the history, move focus to its title (screen readers announce it)
  useEffect(() => {
    if (conv.status !== 'loading' && focusTitleNext.current) {
      focusTitleNext.current = false
      titleRef.current?.focus()
    }
  }, [conv.status])

  // ---------- Scrolling ----------
  const scrollRef = useRef(null)
  const atBottom = useRef(true)
  const [newBelow, setNewBelow] = useState(false)
  const messageCount = conv.messages.length

  const scrollToBottom = useCallback(
    (smooth = true) => {
      const el = scrollRef.current
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: smooth && !reduce ? 'smooth' : 'auto' })
    },
    [reduce],
  )

  const onScroll = () => {
    const el = scrollRef.current
    atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
    if (atBottom.current) setNewBelow(false)
  }

  // A chat just loaded: jump to its end. A new chat (welcome screen) starts at the top.
  useLayoutEffect(() => {
    if (conv.status !== 'ready') return
    atBottom.current = true
    if (conv.messages.length) scrollToBottom(false)
    else scrollRef.current?.scrollTo({ top: 0 })
    // only when a chat opens, not on every new message (that's the next effect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conv.status, chatId, scrollToBottom])

  // New message or "thinking": follow it, unless the student scrolled up to read
  useLayoutEffect(() => {
    if (!messageCount && !thinking) return
    if (atBottom.current) scrollToBottom()
    else setNewBelow(true)
  }, [messageCount, thinking, sendError, scrollToBottom])

  // ---------- Sending ----------
  const send = useCallback(
    async (text, { retryOf } = {}) => {
      const question = text.trim()
      if (!question || thinking) return
      const sentIn = conversation.current
      let pendingId = retryOf

      setSendError(null)
      if (!retryOf) {
        pendingId = `local-${Date.now()}`
        const asked = { id: pendingId, role: 'user', text: question, createdAt: new Date().toISOString(), fresh: true }
        setConv((c) => ({ ...c, title: c.title ?? shortTitle(question), messages: [...c.messages, asked] }))
        setDraft('')
      }
      atBottom.current = true // your own question: always follow it
      setThinking(true)
      if (finePointer() && document.activeElement !== composerRef.current) composerRef.current?.focus({ preventScroll: true })

      try {
        const res = await sendMessage({ chatId, question })
        setHistoryVersion((v) => v + 1)
        if (sentIn !== conversation.current) return // the student moved to another chat (or a new one) meanwhile
        setConv((c) => ({
          ...c,
          messages: [...c.messages.map((m) => (m.id === pendingId ? res.question : m)), { ...res.answer, fresh: true }],
        }))
        setThinking(false)
        if (!chatId) {
          setCreatedChatId(res.chatId)
          navigate(`/dashboard/tutor/${res.chatId}`, { replace: true })
        }
      } catch (err) {
        if (sentIn !== conversation.current) return
        setThinking(false)
        setSendError({ question, questionId: pendingId, message: err?.message })
      }
    },
    [chatId, thinking, navigate],
  )

  // ?q=… (from the dashboard): ask it once the chat is ready, then clean the URL
  const askedFromUrl = useRef(false)
  useEffect(() => {
    const q = params.get('q')?.trim()
    if (!q || askedFromUrl.current || conv.status !== 'ready') return
    askedFromUrl.current = true
    setParams(
      (p) => {
        p.delete('q')
        return p
      },
      { replace: true },
    )
    send(q)
  }, [conv.status, params, setParams, send])

  // Also works when already on /dashboard/tutor (no URL change): reset the screen ourselves
  const startNewChat = () => {
    conversation.current += 1 // forget any answer still on its way
    setHistoryOpen(false)
    setConv(emptyChat)
    setThinking(false)
    setSendError(null)
    setDraft('')
    navigate('/dashboard/tutor')
    composerRef.current?.focus()
  }

  // ---------- Render ----------
  const historyPanel = (
    <ChatHistory
      chats={history.data}
      error={history.error}
      onRetry={history.reload}
      onNewChat={startNewChat}
      onNavigate={() => {
        setHistoryOpen(false)
        focusTitleNext.current = true
      }}
    />
  )

  const lastTutorIndex = conv.messages.findLastIndex((m) => m.role === 'tutor')
  const isEmptyNewChat = conv.status === 'ready' && conv.messages.length === 0 && !thinking

  let body
  if (conv.status === 'loading') body = <ConversationSkeleton />
  else if (conv.status === 'error') body = <ErrorState onRetry={() => setConv({ ...emptyChat, status: 'loading' })} />
  else if (conv.status === 'notfound') {
    body = (
      <NotFoundState
        title="Chat not found"
        text="This conversation doesn’t exist anymore. Start a new one: tooli is ready!"
        backTo="/dashboard/tutor"
        backLabel="Start a new chat"
      />
    )
  } else if (isEmptyNewChat) {
    body = <Welcome firstName={user.firstName} onAsk={(q) => send(q)} disabled={thinking} />
  } else {
    body = (
      <ol
        key={chatId ?? 'new'}
        className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-label="Conversation with tooli"
      >
        {conv.messages.map((m, i) =>
          m.role === 'user' ? (
            <UserBubble key={m.id} message={m} fresh={m.fresh} />
          ) : (
            <TutorMessage
              key={m.id}
              message={m}
              fresh={m.fresh}
              isLast={i === lastTutorIndex && !sendError}
              busy={thinking}
              onFollowUp={(q) => send(q)}
            />
          ),
        )}
        {thinking && <ThinkingBubble />}
        {sendError && (
          <SendError message={sendError.message} onRetry={() => send(sendError.question, { retryOf: sendError.questionId })} />
        )}
      </ol>
    )
  }

  return (
    <div className="flex h-[calc(100dvh-var(--app-header-h,67px))] max-nav:h-[calc(100dvh-var(--app-header-h,111px)-72px-env(safe-area-inset-bottom))]">
      {/* History: side panel from 1024px, a Sheet below */}
      <aside className="hidden w-[300px] shrink-0 border-r border-border bg-card p-4 lg:flex lg:flex-col" aria-label="Chat history">
        {historyPanel}
      </aside>

      <section className="flex min-w-0 flex-1 flex-col" aria-labelledby="tutor-chat-title">
        <header className="flex items-center gap-2 border-b border-border bg-background px-4 py-2.5 lg:px-6">
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <Tooltip>
              <TooltipTrigger asChild>
                <SheetTrigger asChild>
                  <Button variant="tile" size="icon" className="lg:hidden" aria-label="Your chats">
                    <History size={18} aria-hidden="true" />
                  </Button>
                </SheetTrigger>
              </TooltipTrigger>
              <TooltipContent>Your chats</TooltipContent>
            </Tooltip>
            <SheetContent side="left" className="w-[300px] bg-card px-4 pt-12 pb-4">
              <SheetTitle className="sr-only">Your chats</SheetTitle>
              {historyPanel}
            </SheetContent>
          </Sheet>

          <h1
            id="tutor-chat-title"
            ref={titleRef}
            tabIndex={-1}
            className="min-w-0 flex-1 truncate text-base font-semibold outline-none"
          >
            {conv.status === 'ready' ? (conv.title ?? 'New chat') : 'AI tutor'}
          </h1>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="tile" size="icon" className="lg:hidden" aria-label="New chat" onClick={startNewChat}>
                <MessageSquarePlus size={18} aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New chat</TooltipContent>
          </Tooltip>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto">
            {body}
          </div>

          <AnimatePresence>
            {newBelow && (
              <motion.button
                type="button"
                onClick={() => {
                  setNewBelow(false)
                  scrollToBottom()
                }}
                className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lift"
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: 8 }}
              >
                <ArrowDown size={16} aria-hidden="true" /> New message
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {!['notfound', 'error'].includes(conv.status) && (
          <div className={cn('border-t border-border bg-background px-4 pt-3 pb-2', isEmptyNewChat && 'border-t-0')}>
            <Composer ref={composerRef} value={draft} onChange={setDraft} onSend={(text) => send(text)} busy={thinking} />
          </div>
        )}
      </section>
    </div>
  )
}

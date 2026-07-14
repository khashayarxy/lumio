'use client'

import { useEffect, useRef, useState } from 'react'
import { Crown, Send, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  participants as seedParticipants,
  seedMessages,
  type ChatMessage,
} from '@/lib/lumio-data'

type Tab = 'chat' | 'people'

export function ChatPanel() {
  const [tab, setTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages)
  const [draft, setDraft] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, tab])

  function send(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    const now = new Date()
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}`,
        author: 'You',
        color: '#7C5CFF',
        text,
        time: `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`,
        self: true,
      },
    ])
    setDraft('')
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (
      e.key === 'Enter' &&
      !e.shiftKey &&
      !e.nativeEvent.isComposing &&
      e.keyCode !== 229
    ) {
      e.preventDefault()
      send(e as unknown as React.FormEvent)
    }
  }

  return (
    <div className="glass flex h-full flex-col overflow-hidden rounded-3xl">
      {/* tabs */}
      <div className="flex items-center gap-1 border-b border-border p-2">
        <button
          type="button"
          onClick={() => setTab('chat')}
          className={cn(
            'flex-1 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            tab === 'chat'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          Chat
        </button>
        <button
          type="button"
          onClick={() => setTab('people')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
            tab === 'people'
              ? 'bg-secondary text-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <Users className="size-4" />
          People
          <span className="rounded-full bg-primary/20 px-1.5 text-xs text-primary">
            {seedParticipants.length}
          </span>
        </button>
      </div>

      {tab === 'chat' ? (
        <>
          <div
            ref={listRef}
            className="flex-1 space-y-4 overflow-y-auto p-4"
          >
            {messages.map((m) => (
              <div key={m.id} className="flex gap-3">
                <span
                  className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold text-white"
                  style={{ backgroundColor: m.color }}
                  aria-hidden="true"
                >
                  {m.author.charAt(0)}
                </span>
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span
                      className="text-sm font-medium"
                      style={{ color: m.self ? undefined : m.color }}
                    >
                      {m.author}
                    </span>
                    <span className="text-xs text-muted-foreground">{m.time}</span>
                  </div>
                  <p className="text-pretty text-sm leading-relaxed text-foreground/90">
                    {m.text}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={send} className="border-t border-border p-3">
            <div className="flex items-center gap-2 rounded-2xl border border-input bg-background/40 p-1.5 pl-3 transition-colors focus-within:border-ring">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Send a message"
                aria-label="Message"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
              />
              <Button
                type="submit"
                size="icon"
                className="size-9 shrink-0 rounded-xl hover:bg-primary/90"
                aria-label="Send message"
                disabled={!draft.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="flex-1 space-y-1 overflow-y-auto p-3">
          {seedParticipants.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors hover:bg-secondary/60"
            >
              <span className="relative">
                <span
                  className="grid size-9 place-items-center rounded-full text-sm font-semibold text-white"
                  style={{ backgroundColor: p.color }}
                  aria-hidden="true"
                >
                  {p.name.charAt(0)}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card bg-success" />
              </span>
              <span className="flex-1 text-sm font-medium text-foreground">
                {p.name}
              </span>
              {p.host && (
                <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
                  <Crown className="size-3" />
                  Host
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

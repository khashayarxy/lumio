'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Check, Copy, LogOut } from 'lucide-react'
import { LumioLogo } from '@/components/lumio-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { VideoPlayer } from '@/components/room/video-player'
import { ChatPanel } from '@/components/room/chat-panel'
import { movies, participants } from '@/lib/lumio-data'

export function WatchRoom({ roomId }: { roomId: string }) {
  // Deterministically pick a movie from the room id so it feels stable
  const index =
    Math.abs(
      roomId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    ) % movies.length
  const movie = movies[index]

  const [copied, setCopied] = useState(false)
  const [, setPlaying] = useState(false)

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(roomId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* room header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="Lumio home">
              <LumioLogo showWordmark={false} />
            </Link>
            <div className="hidden sm:block">
              <p className="text-sm font-medium leading-tight text-foreground">
                {movie.title}
              </p>
              <p className="text-xs text-muted-foreground">Watching together</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* participants preview */}
            <div className="mr-1 hidden items-center -space-x-2 sm:flex">
              {participants.map((p, i) => (
                <span
                  key={p.id}
                  className="grid size-8 place-items-center rounded-full border-2 border-background text-[11px] font-semibold text-white"
                  style={{ backgroundColor: p.color, zIndex: participants.length - i }}
                  title={p.name}
                >
                  {p.name.charAt(0)}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={copyCode}
              className="glass flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-white/15"
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4 text-muted-foreground" />
              )}
              <span className="tabular-nums">{roomId}</span>
            </button>

            <Link
              href="/rooms"
              className={cn(
                buttonVariants({ variant: 'destructive', size: 'lg' }),
                'rounded-full px-4',
              )}
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Leave</span>
            </Link>
          </div>
        </div>
      </header>

      {/* body */}
      <div className="mx-auto grid w-full max-w-[1400px] flex-1 gap-5 p-5 lg:grid-cols-[1fr_360px]">
        <div className="flex min-w-0 flex-col gap-5">
          <VideoPlayer movie={movie} onPlaybackChange={setPlaying} />

          {/* now playing info */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-start gap-4">
              <img
                src={movie.poster || '/placeholder.svg'}
                alt={`${movie.title} poster`}
                className="hidden h-28 w-20 shrink-0 rounded-xl object-cover sm:block"
              />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full bg-secondary px-2.5 py-1">
                    {movie.genre}
                  </span>
                  <span>{movie.year}</span>
                  <span>·</span>
                  <span>{movie.duration}</span>
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight">
                  {movie.title}
                </h1>
                <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                  {movie.synopsis}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* chat rail */}
        <aside className="h-[calc(100vh-6rem)] lg:sticky lg:top-[5.5rem]">
          <ChatPanel />
        </aside>
      </div>
    </div>
  )
}

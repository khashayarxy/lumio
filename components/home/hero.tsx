'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Play, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { movies } from '@/lib/lumio-data'

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8)
}

export function Hero() {
  const router = useRouter()
  const [code, setCode] = useState('')

  function createRoom() {
    router.push(`/room/${randomRoomId()}`)
  }

  function joinRoom(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = code.trim()
    if (!trimmed) return
    router.push(`/room/${encodeURIComponent(trimmed.toLowerCase())}`)
  }

  return (
    <section className="relative overflow-hidden px-5 pb-24 pt-20 md:pt-28">
      {/* ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background:
            'radial-gradient(closest-side, rgba(124,92,255,0.45), rgba(83,184,255,0.12), transparent)',
        }}
      />

      <div className="mx-auto max-w-3xl text-center">
        <span className="animate-rise glass mx-auto inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="relative flex size-2">
            <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-success" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
          Movie night, perfectly in sync
        </span>

        <h1 className="animate-rise mt-6 text-balance text-5xl font-semibold leading-[1.05] tracking-tight md:text-7xl">
          Watch together,
          <br />
          <span className="text-gradient">as if you were there.</span>
        </h1>

        <p className="animate-rise mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
          Lumio turns any film into a shared moment. Create a room, invite your
          friends, and press play — every frame stays in sync, with chat that
          feels like sitting on the same couch.
        </p>

        {/* Create + Join */}
        <div className="animate-rise mx-auto mt-10 flex max-w-md flex-col gap-3">
          <Button
            onClick={createRoom}
            size="lg"
            className="h-13 rounded-2xl bg-primary px-6 text-base font-medium text-primary-foreground shadow-[0_16px_40px_-16px_rgba(124,92,255,0.9)] hover:bg-primary/90"
          >
            <Plus className="size-5" />
            Create a room
            <ArrowRight className="size-5" />
          </Button>

          <div className="flex items-center gap-3 py-1">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or join with a code</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={joinRoom} className="glass flex items-center gap-2 rounded-2xl p-2">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter room code"
              aria-label="Room code"
              className="h-11 flex-1 rounded-xl bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground/70"
            />
            <Button
              type="submit"
              size="lg"
              variant="secondary"
              className="h-11 rounded-xl px-4"
            >
              Join
            </Button>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          <span>Free to start · No download required</span>
        </div>
      </div>

      {/* Cinematic preview */}
      <div className="animate-rise mx-auto mt-16 max-w-5xl">
        <div className="glass-strong brand-glow relative overflow-hidden rounded-3xl p-2">
          <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-black">
            <img
              src="/posters/still-wide.png"
              alt="A cinematic film still playing in a Lumio room"
              className="size-full object-cover opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

            {/* floating play */}
            <div className="absolute inset-0 grid place-items-center">
              <span className="animate-float grid size-20 place-items-center rounded-full bg-primary/90 text-primary-foreground backdrop-blur-sm">
                <Play className="size-8 translate-x-0.5 fill-current" />
              </span>
            </div>

            {/* bottom bar mock */}
            <div className="absolute inset-x-4 bottom-4 flex items-center gap-3 rounded-2xl bg-black/40 p-3 backdrop-blur-md">
              <span className="text-xs font-medium text-foreground">01:12:44</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/15">
                <span className="absolute inset-y-0 left-0 w-[62%] rounded-full bg-primary" />
              </span>
              <span className="text-xs text-muted-foreground">01:52:00</span>
            </div>

            {/* watching avatars */}
            <div className="absolute right-4 top-4 flex items-center -space-x-2">
              {movies.slice(0, 3).map((m, i) => (
                <span
                  key={m.id}
                  className="grid size-8 place-items-center rounded-full border-2 border-black/60 bg-secondary text-[10px] font-semibold"
                  style={{ zIndex: 3 - i }}
                >
                  {m.title.charAt(0)}
                </span>
              ))}
              <span className="ml-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-foreground backdrop-blur-md">
                4 watching
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

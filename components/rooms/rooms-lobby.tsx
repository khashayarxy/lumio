'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { ArrowRight, Lock, Plus, Radio, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { activeRooms } from '@/lib/lumio-data'

function randomRoomId() {
  return Math.random().toString(36).slice(2, 8)
}

export function RoomsLobby() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const rooms = activeRooms()

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
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-10">
      <div className="max-w-2xl">
        <h1 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          Rooms
        </h1>
        <p className="mt-3 text-pretty text-lg leading-relaxed text-muted-foreground">
          Jump into a room that is already live, or start a new one and bring your
          friends along.
        </p>
      </div>

      {/* Create + Join panel */}
      <div className="mt-10 grid gap-4 lg:grid-cols-2">
        <div className="glass-strong brand-glow flex flex-col justify-between gap-6 rounded-3xl p-7">
          <div>
            <span className="grid size-11 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Plus className="size-5" />
            </span>
            <h2 className="mt-5 text-xl font-medium">Start a new room</h2>
            <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
              Create a private space and get a code to share instantly.
            </p>
          </div>
          <Button
            onClick={createRoom}
            size="lg"
            className="h-12 w-full rounded-2xl text-base hover:bg-primary/90 sm:w-auto sm:self-start sm:px-6"
          >
            Create room
            <ArrowRight className="size-5" />
          </Button>
        </div>

        <div className="glass flex flex-col justify-between gap-6 rounded-3xl p-7">
          <div>
            <span className="grid size-11 place-items-center rounded-2xl bg-[#53B8FF]/15 text-[#53B8FF]">
              <Lock className="size-5" />
            </span>
            <h2 className="mt-5 text-xl font-medium">Join with a code</h2>
            <p className="mt-1.5 text-pretty leading-relaxed text-muted-foreground">
              Got a code from a friend? Drop it in and you are in.
            </p>
          </div>
          <form onSubmit={joinRoom} className="flex flex-col gap-2 sm:flex-row">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter room code"
              aria-label="Room code"
              className="h-12 flex-1 rounded-2xl border border-input bg-background/40 px-4 text-base outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-ring"
            />
            <Button type="submit" size="lg" variant="secondary" className="h-12 rounded-2xl px-6 text-base">
              Join
            </Button>
          </form>
        </div>
      </div>

      {/* Active rooms */}
      <div className="mt-14 flex items-center justify-between">
        <h2 className="text-xl font-medium">Live now</h2>
        <span className="flex items-center gap-2 text-sm text-muted-foreground">
          <Radio className="size-4 text-success" />
          {rooms.length} active rooms
        </span>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rooms.map((room) => (
          <Link
            key={room.id}
            href={`/room/${room.id}`}
            className="glass group overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <img
                src={room.movie.poster || '/placeholder.svg'}
                alt={`${room.movie.title} poster`}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
              <span
                className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${
                  room.status === 'live'
                    ? 'bg-success/20 text-success'
                    : 'bg-primary/20 text-primary'
                }`}
              >
                <span className="size-1.5 rounded-full bg-current" />
                {room.status === 'live' ? 'Live' : 'Starting'}
              </span>
              <span className="absolute bottom-3 left-3 right-3 text-sm font-medium text-foreground">
                {room.movie.title}
              </span>
            </div>
            <div className="flex items-center justify-between p-5">
              <div>
                <p className="font-medium text-foreground">{room.name}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Hosted by {room.host}
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs text-muted-foreground">
                <Users className="size-3.5" />
                {room.watching}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

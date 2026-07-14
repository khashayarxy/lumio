# Lumio - Missing Implementation Analysis

**Analysis Date:** 2026-07-14  
**Project:** khashayarxy/lumio  
**Scope:** Frontend-only prototype with seed/mock data and hardcoded values

---

## Table of Contents

1. [Seed Data & Mock Arrays](#seed-data--mock-arrays)
2. [Hardcoded Values](#hardcoded-values)
3. [Client-Only State Management](#client-only-state-management)
4. [Missing Backend Integrations](#missing-backend-integrations)
5. [Placeholder Components & Logic](#placeholder-components--logic)
6. [Dependencies Analysis](#dependencies-analysis)

---

## Seed Data & Mock Arrays

### 1. Movie Database

**File Path:** `lib/lumio-data.ts` (lines 11-62)

**Issue:** 
- Complete movie database is hardcoded as a static array with 5 fictional movies
- All movie data (title, year, genre, duration, poster URLs, synopsis) is invented
- No connection to any backend or real movie database

**Why It's Incomplete:**
- Movies are hardcoded instead of fetched from a database
- Movie posters are placeholder paths (`/posters/neon-drift.png`) that don't exist
- No movie search, filtering, or discovery functionality
- Movies cannot be added/removed/edited through the UI
- Movie metadata is not dynamic

**Real Implementation Should:**
```typescript
// Instead of:
export const movies: Movie[] = [ ... ]

// Should fetch from:
async function getMovies(): Promise<Movie[]> {
  const response = await fetch('/api/movies')
  return response.json()
}

// Database table: movies
// - Store titles, genres, years, synopses, actual video URLs
// - Support CRUD operations via API
// - Link to actual video storage (S3, Cloudinary, etc.)
// - Support movie metadata (ratings, watched count, etc.)
```

**Files That Depend On It:**
- `components/home/hero.tsx` (line 7) - imports movies for preview avatars
- `components/home/showcase.tsx` - displays movie grid
- `components/rooms/rooms-lobby.tsx` (line 8) - uses activeRooms() function
- `components/room/watch-room.tsx` (line 11) - selects movie for room
- `components/room/video-player.tsx` (line 14) - receives movie object

---

### 2. Participant/User List

**File Path:** `lib/lumio-data.ts` (lines 64-76)

**Issue:**
- 4 hardcoded participant objects representing fake users
- All participant data is static: IDs, names, colors
- Includes "You" as always the host (unrealistic)
- No real user authentication or data

**Why It's Incomplete:**
- Participants are demo data, not real room members
- No actual user accounts or identities
- Host status is hardcoded instead of determined dynamically
- Cannot add/remove participants from a room
- No participant status tracking (online/offline/idle)

**Real Implementation Should:**
```typescript
// Instead of:
export const participants: Participant[] = [
  { id: 'you', name: 'You', color: '#7C5CFF', host: true },
  ...
]

// Should fetch:
async function getRoomParticipants(roomId: string): Promise<Participant[]> {
  const response = await fetch(`/api/rooms/${roomId}/participants`)
  return response.json()
}

// Database table: room_participants
// - Links users to rooms with join timestamps
// - Tracks which user is the host
// - Stores participant status and metadata
```

**Files That Depend On It:**
- `components/room/watch-room.tsx` (line 11) - displays participant avatars in header
- `components/room/chat-panel.tsx` (line 8) - shows participants in "People" tab (line 148)

---

### 3. Seed Chat Messages

**File Path:** `lib/lumio-data.ts` (lines 78-109)

**Issue:**
- 3 hardcoded chat messages from fake participants
- Messages have fake timestamps (20:41, 20:42)
- Used as initial state for every room

**Why It's Incomplete:**
- Same messages appear in every room (no persistence)
- No message history from past sessions
- Cannot load previous conversations
- All message IDs are hardcoded
- Time format is static (not current time)

**Real Implementation Should:**
```typescript
// Instead of:
export const seedMessages: ChatMessage[] = [
  { id: 'm1', author: 'Mina', text: '...', time: '20:41', ... },
  ...
]

// Should fetch:
async function getRoomMessages(roomId: string): Promise<ChatMessage[]> {
  const response = await fetch(`/api/rooms/${roomId}/messages`)
  return response.json()
}

// Database table: messages
// - Store room_id, user_id, content, created_at timestamp
// - Support pagination/infinite scroll for history
// - Store actual creation times, not hardcoded strings
```

**Files That Depend On It:**
- `components/room/chat-panel.tsx` (lines 8-9) - imports seedMessages and seedParticipants
- `components/room/chat-panel.tsx` (line 17) - initializes messages state with seedMessages

---

### 4. Active Rooms List

**File Path:** `lib/lumio-data.ts` (lines 111-146)

**Issue:**
- Function `activeRooms()` returns 4 hardcoded room objects
- Room IDs are fake (aurora, orbit, goldenroom, trail)
- Room watching counts are static numbers
- All rooms show "live" or "starting" status
- Host names are hardcoded

**Why It's Incomplete:**
- Rooms are not fetched from database (no persistence)
- Rooms don't actually exist - cannot join them
- Watching counts never update
- Room status is fake (all show as live/starting)
- No real-time room updates

**Real Implementation Should:**
```typescript
// Instead of:
export function activeRooms() {
  return [ { id: 'aurora', ... }, ... ]
}

// Should fetch:
async function getActiveRooms(): Promise<Room[]> {
  const response = await fetch('/api/rooms?status=live')
  return response.json()
}

// Database table: rooms
// - Store actual room IDs, host IDs, movie selections
// - Track current watching count via room_participants
// - Store room status and creation time
// - Support real-time updates via WebSocket
```

**Files That Depend On It:**
- `components/rooms/rooms-lobby.tsx` (line 8) - imports activeRooms function
- `components/rooms/rooms-lobby.tsx` (line 17) - calls activeRooms() to render room cards

---

## Hardcoded Values

### 1. Room ID Generation

**File Path:** `components/home/hero.tsx` (lines 9-11)

**Function:**
```typescript
function randomRoomId() {
  return Math.random().toString(36).slice(2, 8)
}
```

**Issue:**
- Room IDs are randomly generated on the client
- No validation that room ID is unique
- No backend reservation/creation
- Room doesn't actually exist after generation

**Why It's Incomplete:**
- Client-side generation is collision-prone
- No way to persist the room
- Cannot guarantee room ID uniqueness across different users
- No way to recover room if user closes browser

**Real Implementation Should:**
```typescript
// Instead of generating locally:
async function createRoom(): Promise<string> {
  const response = await fetch('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({ movie_id: selectedMovie.id })
  })
  const { room_id } = await response.json()
  return room_id
}

// Server generates unique ID and stores in database
```

**Usage:**
- `components/home/hero.tsx` - "Create a room" button (line 18)
- `components/rooms/rooms-lobby.tsx` - "Create room" button (line 20)

---

### 2. Video Source URL

**File Path:** `components/room/video-player.tsx` (line 16-17)

**Code:**
```typescript
const SAMPLE_SRC =
  'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
```

**Issue:**
- All rooms play the same sample video (Big Buck Bunny)
- Video URL is hardcoded, not related to movie selection
- No video streaming from actual movie files
- Video is from public Google Storage, not your server

**Why It's Incomplete:**
- Same video for all movies regardless of selection
- No connection between selected movie and video
- No video storage/delivery infrastructure
- No DRM or access control
- Cannot support different video qualities

**Real Implementation Should:**
```typescript
// Instead of:
const SAMPLE_SRC = 'https://storage.googleapis.com/...'

// Should pass movie URL:
export function VideoPlayer({
  movie,  // movie.video_url would contain actual video
  onPlaybackChange,
}: {
  movie: Movie  // Movie has video_url property
  onPlaybackChange?: (playing: boolean) => void
}) {
  const videoUrl = movie.video_url  // Fetch from movie data
  
  return (
    <video src={videoUrl} ... />
  )
}

// Movie data should include:
// - video_url: URL to actual video file
// - video_quality: Available resolutions (1080p, 720p, etc.)
// - video_duration: Actual video length (not hardcoded)
```

**Files That Depend On It:**
- `components/room/video-player.tsx` - used in line 144

---

### 3. Hero Section Mock UI Elements

**File Path:** `components/home/hero.tsx` (lines 122-129)

**Code:**
```typescript
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
    // ...
  ))}
  <span className="ml-3 rounded-full bg-black/50 px-2.5 py-1 text-xs text-foreground backdrop-blur-md">
    4 watching
  </span>
</div>
```

**Issue:**
- Hardcoded time values: "01:12:44" / "01:52:00"
- Hardcoded progress bar: "w-[62%]"
- Hardcoded watcher count: "4 watching"
- Uses first 3 movies from array for avatar preview
- All values are demo data

**Why It's Incomplete:**
- Times don't match any actual content
- Progress bar percentage is arbitrary
- Watcher count is fake
- Movie avatars shown are not relevant to what's being played

**Real Implementation Should:**
```typescript
// The preview should show:
// - Actual current playback time from a real room
// - Real progress percentage
// - Actual number of people watching
// - Relevant participants in that room

// Or remove this mock entirely since it's just for show
// and replace with real room data when backend is ready
```

---

### 4. Hardcoded Participant Avatar Colors

**File Path:** `lib/lumio-data.ts` (lines 71-76)

**Code:**
```typescript
export const participants: Participant[] = [
  { id: 'you', name: 'You', color: '#7C5CFF', host: true },
  { id: 'mina', name: 'Mina', color: '#53B8FF' },
  { id: 'arash', name: 'Arash', color: '#2ED47A' },
  { id: 'sara', name: 'Sara', color: '#FF5C7A' },
]
```

**Issue:**
- Colors are manually assigned to fake users
- Always the same 4 participants in every room
- No color assignment algorithm for real users
- Cannot handle more than 4 users

**Why It's Incomplete:**
- Real rooms can have many more participants
- Need algorithm for assigning colors to users dynamically
- Current approach doesn't scale

**Real Implementation Should:**
```typescript
// Color palette for participants
const PARTICIPANT_COLORS = [
  '#7C5CFF', '#53B8FF', '#2ED47A', '#FF5C7A',
  '#FFA500', '#FF6B9D', '#00D9FF', '#9D00FF',
  // ... extend palette
]

// Assign colors based on user ID hash
function getUserColor(userId: string): string {
  const hash = userId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0)
  const index = hash % PARTICIPANT_COLORS.length
  return PARTICIPANT_COLORS[index]
}

// Or store assigned color in user profile/room_participants table
```

---

### 5. Sync Status Indicator

**File Path:** `components/room/video-player.tsx` (lines 164-170)

**Code:**
```typescript
<span className="flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-foreground backdrop-blur-md">
  <span className="relative flex size-2">
    <span className="animate-pulse-ring absolute inline-flex size-full rounded-full bg-success" />
    <span className="relative inline-flex size-2 rounded-full bg-success" />
  </span>
  In sync with room
</span>
```

**Issue:**
- Always displays "In sync with room" - no actual sync state tracking
- Green indicator is always on (no red/warning states)
- No way to detect if room is out of sync
- Status never changes

**Why It's Incomplete:**
- Assumes perfect sync with no backend to verify
- No real-time sync state from server
- Cannot show desync warnings to users
- No latency/buffer monitoring

**Real Implementation Should:**
```typescript
// Track actual sync state from server
const [syncState, setSyncState] = useState<'synced' | 'syncing' | 'desync'>('synced')

// Listen to sync events from WebSocket
useEffect(() => {
  socket.on('sync-state', (state) => {
    setSyncState(state)
  })
}, [])

// Display state appropriately
<span className={`
  ${syncState === 'synced' ? 'text-success' : ''}
  ${syncState === 'syncing' ? 'text-amber-500' : ''}
  ${syncState === 'desync' ? 'text-destructive' : ''}
`}>
  {syncState === 'synced' && 'In sync with room'}
  {syncState === 'syncing' && 'Syncing...'}
  {syncState === 'desync' && 'Out of sync - reconnecting'}
</span>
```

---

## Client-Only State Management

### 1. Chat Messages

**File Path:** `components/room/chat-panel.tsx` (lines 15-43)

**Code:**
```typescript
export function ChatPanel() {
  const [tab, setTab] = useState<Tab>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>(seedMessages)
  const [draft, setDraft] = useState('')
  
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
}
```

**Issue:**
- Messages stored only in component state (React useState)
- Messages disappear on page refresh
- Messages not sent to backend/database
- Only visible to current user (not real-time sync)
- No message history persistence

**Why It's Incomplete:**
- No backend API call to POST message
- No persistence in database
- Cannot load message history
- No real-time message sync across participants
- Each user sees different messages (no consensus)

**Real Implementation Should:**
```typescript
// Replace local state with server state:
const [messages, setMessages] = useState<ChatMessage[]>([])

// Fetch existing messages on mount
useEffect(() => {
  async function loadMessages() {
    const response = await fetch(`/api/rooms/${roomId}/messages`)
    const data = await response.json()
    setMessages(data)
  }
  loadMessages()
}, [roomId])

// Send message to server
async function send(e: React.FormEvent) {
  e.preventDefault()
  const text = draft.trim()
  if (!text) return
  
  const response = await fetch(`/api/rooms/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content: text })
  })
  
  if (response.ok) {
    const newMessage = await response.json()
    setMessages(prev => [...prev, newMessage])
    setDraft('')
  }
}

// Listen for real-time messages from WebSocket
useEffect(() => {
  socket.on('message', (msg) => {
    setMessages(prev => [...prev, msg])
  })
}, [])
```

**Files That Depend On It:**
- `components/room/chat-panel.tsx` - entire component

---

### 2. Video Playback State

**File Path:** `components/room/video-player.tsx` (lines 37-44)

**Code:**
```typescript
const [playing, setPlaying] = useState(false)
const [current, setCurrent] = useState(0)
const [duration, setDuration] = useState(0)
const [volume, setVolume] = useState(0.8)
const [muted, setMuted] = useState(false)
const [fullscreen, setFullscreen] = useState(false)
const [controlsVisible, setControlsVisible] = useState(true)
const [ready, setReady] = useState(false)
```

**Issue:**
- All playback state is local to one video element
- No sync with other participants' playback
- Play/pause events not sent to other users
- Seek position only affects this user
- No server-side playback state tracking

**Why It's Incomplete:**
- When one user plays, others don't see play (not synchronized)
- When one user seeks to 01:00:00, others stay at 00:30:00
- No shared playback timeline
- Cannot resume from same point after disconnect

**Real Implementation Should:**
```typescript
// When user plays/pauses:
function togglePlay() {
  const v = videoRef.current
  if (!v) return
  
  if (v.paused) {
    void v.play()
    // Send play event to server
    socket.emit('playback-change', {
      roomId,
      action: 'play',
      currentTime: v.currentTime
    })
  } else {
    v.pause()
    socket.emit('playback-change', {
      roomId,
      action: 'pause',
      currentTime: v.currentTime
    })
  }
}

// When user seeks:
function onScrub(e: React.ChangeEvent<HTMLInputElement>) {
  const v = videoRef.current
  if (!v) return
  const time = (Number(e.target.value) / 100) * (v.duration || 0)
  v.currentTime = time
  setCurrent(time)
  
  socket.emit('playback-change', {
    roomId,
    action: 'seek',
    currentTime: time
  })
}

// Listen for other users' playback changes
useEffect(() => {
  socket.on('playback-update', ({ action, currentTime }) => {
    if (videoRef.current) {
      if (action === 'play') {
        videoRef.current.currentTime = currentTime
        void videoRef.current.play()
      } else if (action === 'pause') {
        videoRef.current.currentTime = currentTime
        videoRef.current.pause()
      } else if (action === 'seek') {
        videoRef.current.currentTime = currentTime
      }
    }
  })
}, [])
```

---

## Missing Backend Integrations

### 1. No Room Creation Endpoint

**File Path:** `components/home/hero.tsx` (lines 17-19) and `components/rooms/rooms-lobby.tsx` (lines 19-21)

**Current Code:**
```typescript
function createRoom() {
  router.push(`/room/${randomRoomId()}`)
}
```

**Issue:**
- Room creation is just client-side navigation
- No API call to create room on backend
- Room doesn't exist in database
- Cannot verify room is valid

**Real Implementation Should:**
```typescript
async function createRoom() {
  try {
    const response = await fetch('/api/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        movieId: selectedMovie?.id,
      })
    })
    
    if (!response.ok) throw new Error('Failed to create room')
    
    const { roomId } = await response.json()
    router.push(`/room/${roomId}`)
  } catch (error) {
    console.error(error)
    // Show error toast to user
  }
}
```

---

### 2. No Room Join Validation

**File Path:** `components/home/hero.tsx` (lines 21-26) and `components/rooms/rooms-lobby.tsx` (lines 23-28)

**Current Code:**
```typescript
function joinRoom(e: React.FormEvent) {
  e.preventDefault()
  const trimmed = code.trim()
  if (!trimmed) return
  router.push(`/room/${encodeURIComponent(trimmed.toLowerCase())}`)
}
```

**Issue:**
- No validation that room code actually exists
- User navigated to room even if invalid
- No error handling
- No way to show "room not found"

**Real Implementation Should:**
```typescript
async function joinRoom(e: React.FormEvent) {
  e.preventDefault()
  const trimmed = code.trim()
  if (!trimmed) return
  
  try {
    // Validate room exists
    const response = await fetch(`/api/rooms/${encodeURIComponent(trimmed.toLowerCase())}`)
    
    if (response.status === 404) {
      setError('Room not found')
      return
    }
    
    if (!response.ok) throw new Error('Failed to join room')
    
    // Add user to room
    const joinResponse = await fetch(
      `/api/rooms/${encodeURIComponent(trimmed.toLowerCase())}/join`,
      { method: 'POST' }
    )
    
    if (!joinResponse.ok) throw new Error('Failed to join')
    
    router.push(`/room/${encodeURIComponent(trimmed.toLowerCase())}`)
  } catch (error) {
    setError(error.message)
  }
}
```

---

### 3. No Room Data Loading

**File Path:** `components/room/watch-room.tsx` (lines 13-19)

**Current Code:**
```typescript
export function WatchRoom({ roomId }: { roomId: string }) {
  // Deterministically pick a movie from the room id so it feels stable
  const index =
    Math.abs(
      roomId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
    ) % movies.length
  const movie = movies[index]
```

**Issue:**
- Room data is not fetched from backend
- Movie is determined by hashing room ID, not actual room data
- No room host, participants, or status
- Cannot show real room details

**Real Implementation Should:**
```typescript
const [room, setRoom] = useState<Room | null>(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)

useEffect(() => {
  async function loadRoom() {
    try {
      const response = await fetch(`/api/rooms/${roomId}`)
      
      if (!response.ok) {
        setError('Room not found')
        return
      }
      
      const roomData = await response.json()
      setRoom(roomData)
    } catch (err) {
      setError('Failed to load room')
    } finally {
      setLoading(false)
    }
  }
  
  loadRoom()
}, [roomId])

if (loading) return <LoadingScreen />
if (error) return <ErrorScreen message={error} />
if (!room) return <ErrorScreen message="Room not found" />

const movie = room.movie  // Actual movie from database
```

---

### 4. No Real-Time Synchronization

**File Path:** Entire `components/room/` folder

**Issue:**
- No WebSocket connection for real-time events
- No message delivery to other participants
- No playback state sync
- No participant presence tracking
- No room state updates

**Real Implementation Should:**
```typescript
// app/room/[id]/use-room-socket.ts
import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'

export function useRoomSocket(roomId: string) {
  const socketRef = useRef<Socket | null>(null)
  
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      query: { roomId },
      auth: { token: getAuthToken() }
    })
    
    return () => {
      socketRef.current?.disconnect()
    }
  }, [roomId])
  
  return socketRef.current
}

// Usage in components:
export function VideoPlayer({ movie, onPlaybackChange }: Props) {
  const socket = useRoomSocket(roomId)
  
  // Send playback events
  function togglePlay() {
    // ... local state update
    socket?.emit('playback-change', { action: 'play', time: currentTime })
  }
  
  // Listen for remote events
  useEffect(() => {
    socket?.on('playback-update', (data) => {
      // ... update video element to match other users
    })
  }, [socket])
}
```

---

## Placeholder Components & Logic

### 1. Deterministic Movie Selection

**File Path:** `components/room/watch-room.tsx` (lines 14-19)

**Code:**
```typescript
// Deterministically pick a movie from the room id so it feels stable
const index =
  Math.abs(
    roomId.split('').reduce((acc, ch) => acc + ch.charCodeAt(0), 0),
  ) % movies.length
const movie = movies[index]
```

**Issue:**
- Movie is selected by hashing room ID, not by actual room data
- Same room ID always maps to same movie
- Not how real rooms would work
- Comment says "so it feels stable" - acknowledges this is temporary

**Why It's Incomplete:**
- This is a workaround to avoid fetching room data
- Real implementation would store movie selection in room record
- This breaks if seed movies array is reordered

**Real Implementation Should:**
- Fetch room data: `const room = await fetch('/api/rooms/:id')`
- Use: `const movie = room.movie`

---

### 2. Hardcoded Room Participants

**File Path:** `components/room/chat-panel.tsx` (line 8-10, 148)

**Code:**
```typescript
import {
  participants as seedParticipants,
  seedMessages,
  type ChatMessage,
} from '@/lib/lumio-data'

// Later...
{seedParticipants.map((p) => (
  // Display participant
))}
```

**Issue:**
- Same 4 participants shown in every room
- Hardcoded participant list, not real room members
- Cannot show actual users in the room

**Why It's Incomplete:**
- This is placeholder data pending backend
- Real implementation would fetch `GET /api/rooms/:id/participants`

---

### 3. No Error Handling

**File Path:** Throughout project

**Issue:**
- No error states for network failures
- No error boundaries
- No fallback UI for failed API calls
- No user feedback for errors

**Why It's Incomplete:**
- Once backend is added, errors will occur
- Need error UI everywhere
- Example: What if video fails to load? What if room is deleted?

**Real Implementation Should:**
```typescript
// Add error boundary component
export function RoomErrorBoundary() {
  const [error, setError] = useState<Error | null>(null)
  
  useEffect(() => {
    const handler = (event: PromiseRejectionEvent) => {
      setError(event.reason)
    }
    window.addEventListener('unhandledrejection', handler)
    return () => window.removeEventListener('unhandledrejection', handler)
  }, [])
  
  if (error) {
    return (
      <div className="grid h-screen place-items-center">
        <div className="text-center">
          <h1>Something went wrong</h1>
          <p>{error.message}</p>
          <button onClick={() => window.location.reload()}>
            Try Again
          </button>
        </div>
      </div>
    )
  }
}

// Wrap rooms in error boundary
<RoomErrorBoundary>
  <WatchRoom roomId={id} />
</RoomErrorBoundary>
```

---

## Dependencies Analysis

### Files With Incomplete Implementations

| File | Issue Type | Severity |
|------|-----------|----------|
| `lib/lumio-data.ts` | Seed data for movies, participants, messages, rooms | Critical |
| `components/home/hero.tsx` | Random room ID generation, mock UI elements | High |
| `components/home/showcase.tsx` | Uses seed movie data | High |
| `components/rooms/rooms-lobby.tsx` | Uses seed active rooms data | High |
| `components/room/watch-room.tsx` | Deterministic movie selection, no room data fetch | Critical |
| `components/room/video-player.tsx` | Hardcoded video URL, fake sync state, no real-time sync | Critical |
| `components/room/chat-panel.tsx` | Client-only state, no backend persistence, no real-time sync | Critical |
| `app/layout.tsx` | No authentication provider | High |
| `app/room/[id]/page.tsx` | No room validation, no error handling | High |

### Dependency Graph

```
lib/lumio-data.ts (SEED DATA)
├── components/home/hero.tsx → movies
├── components/home/showcase.tsx → movies
├── components/rooms/rooms-lobby.tsx → activeRooms()
├── components/room/watch-room.tsx → movies, participants
└── components/room/chat-panel.tsx → participants, seedMessages

components/home/hero.tsx (ROOM CREATION)
└── Uses randomRoomId() → Router.push()

components/room/watch-room.tsx (MAIN ROOM)
├── components/room/video-player.tsx → HARDCODED VIDEO URL
├── components/room/chat-panel.tsx → SEED MESSAGES + LOCAL STATE
└── participants from seed data

MISSING INTEGRATIONS:
├── No API routes (/api/*)
├── No Database (rooms, users, messages, etc.)
├── No WebSocket/Real-time
├── No Authentication/Authorization
└── No Error Handling/Boundaries
```

---

## Summary of Incomplete Implementations

### By Category

**Seed/Mock Data (Files that need backend data):**
- ✗ Movie database (5 fake movies)
- ✗ Participant list (4 fake users)
- ✗ Chat messages (3 fake messages)
- ✗ Active rooms (4 fake rooms)

**Hardcoded Values (Files with hardcoded constants):**
- ✗ Video URL (Big Buck Bunny sample)
- ✗ Room ID generation (client-side random)
- ✗ Hero preview times (01:12:44, 01:52:00)
- ✗ Progress bar (w-[62%])
- ✗ Watcher count (4)
- ✗ Participant colors (manual assignment)
- ✗ Sync status (always "in sync")

**Client-Only State (Files that need backend sync):**
- ✗ Chat messages (useState, no persistence)
- ✗ Video playback (local state, no sync)
- ✗ Room state (no fetching)

**Missing Backend (What needs to be built):**
- ✗ Room creation API (`POST /api/rooms`)
- ✗ Room joining API (`POST /api/rooms/:id/join`)
- ✗ Room validation (`GET /api/rooms/:id`)
- ✗ Messages API (`GET/POST /api/rooms/:id/messages`)
- ✗ Participants API (`GET /api/rooms/:id/participants`)
- ✗ Playback sync WebSocket
- ✗ Real-time message WebSocket
- ✗ Database schema (rooms, users, messages, room_participants, etc.)
- ✗ Authentication system
- ✗ Error handling middleware

### Implementation Priority

**Phase 1 - Critical (App won't work without):**
1. Room creation endpoint
2. Room data fetching
3. WebSocket connection for sync
4. Database schema for rooms, users, messages
5. Authentication system

**Phase 2 - Important (App features won't work):**
1. Message persistence
2. Participant management
3. Playback state sync
4. Error handling
5. Input validation

**Phase 3 - Polish (App will work, but incomplete):**
1. Real movie database
2. Real video storage/CDN
3. Analytics
4. Admin panel
5. User profiles

---

## Notes

- This analysis covers **existing incomplete implementations only**
- Does not include missing features or enhancements
- All items listed require backend development
- Frontend is otherwise well-structured and production-ready for a prototype
- No code changes are needed in frontend structure, only data connections

**Status:** This is a **frontend-only prototype**. All incompleteness is expected and documented in the project analysis.

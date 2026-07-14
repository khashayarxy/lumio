# Lumio - Backend Architecture Design

**Date:** 2026-07-14  
**Status:** Architecture Phase (Pre-Implementation)  
**Scope:** Complete backend system design for MVP + scalable foundation

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Database Architecture](#database-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [API Structure](#api-structure)
6. [Real-Time Architecture](#real-time-architecture)
7. [Caching Strategy](#caching-strategy)
8. [Storage & Media](#storage--media)
9. [Background Jobs](#background-jobs)
10. [Deployment Architecture](#deployment-architecture)
11. [Security](#security)
12. [Scalability Strategy](#scalability-strategy)
13. [Development Roadmap](#development-roadmap)

---

## Overview

### Architecture Principles

- **Stateless API Servers:** All application servers are horizontally scalable
- **Event-Driven:** Core operations emit events for real-time sync
- **Microservice-Ready:** Designed to split into services later
- **Real-Time First:** WebSocket support at architectural level
- **Data-Centric:** Single source of truth for all state
- **Secure by Default:** Security built into every layer

### Core Requirements

From PROJECT_ANALYSIS.md and MISSING_IMPLEMENTATION.md:

✓ Room management (create, join, leave, list)  
✓ Frame-perfect video synchronization  
✓ Real-time chat messaging  
✓ Participant management & presence  
✓ Movie database & streaming  
✓ User authentication & authorization  
✓ Message persistence & history  
✓ Analytics & monitoring  

---

## Tech Stack

### Language & Runtime

**Primary:** Node.js 20 LTS (Long-Term Support)

**Rationale:**
- Mature ecosystem with excellent packages
- Great for real-time applications (WebSocket)
- Large developer pool
- Easy to hire and maintain
- Strong TypeScript support

**Alternative:** Go (for high-throughput services later)

---

### Web Framework

**Primary:** Express.js with TypeScript

**Why:**
- Industry standard, widely understood
- Minimal learning curve
- Excellent middleware ecosystem
- Easy to structure and maintain
- Migration path to Fastify if needed

**Structure:** Express with Controllers > Services > Repository pattern

---

### Database

**Primary:** PostgreSQL 15+

**Justification:**
- ACID compliance for data integrity
- Excellent support for complex queries (room participants, message threads)
- JSON support for flexible metadata
- Full-text search for movie discovery
- LISTEN/NOTIFY for event broadcasting
- Excellent scaling (connection pooling, read replicas)
- Free, open-source, mature

**Secondary:** Redis 7+ (caching & sessions)

**Tertiary:** S3-compatible storage (video & media)

---

### ORM

**Primary:** Prisma 6.x

**Why:**
- Type-safe queries (zero runtime errors)
- Generated migrations (version controlled)
- Excellent developer experience
- Built-in connection pooling
- Real-time subscriptions support
- Easy to test (reset database between tests)

**Alternative:** TypeORM (if Prisma limitations arise later)

---

### Real-Time Communication

**Primary:** Socket.IO 4.x on Node.js

**Why:**
- Automatic fallback to polling (works everywhere)
- Built-in rooms/namespaces for scalability
- Middleware support (auth, logging)
- Excellent scaling with Redis adapter
- Type-safe with TypeScript support

**Alternative:** Raw WebSocket + custom implementation (high maintenance)

---

### Authentication

**Primary:** JWT (JSON Web Tokens) with RefreshTokens

**Backup:** Session-based (Express-session + Redis)

**Social Login:** OAuth2 (Google, GitHub)

**Flow:**
- Access token (15 minutes) stored in memory
- Refresh token (7 days) in HttpOnly cookie
- Automatic refresh before expiry

---

### Message Queue

**Primary:** Bull (Redis-backed job queue)

**Why:**
- Lightweight, simple API
- Doesn't require separate infrastructure
- Good for small to medium workloads
- Easy to monitor and debug
- Later migration path to RabbitMQ/Kafka

**Jobs:**
- Video transcoding
- Email notifications
- Analytics aggregation
- Room cleanup
- Backup exports

---

### Monitoring & Logging

**Primary:** Winston (logging) + Sentry (error tracking)

**Logging Stack:**
- Winston for structured logs
- Log levels: error, warn, info, debug
- Transport to stdout (Docker), file rotation
- Correlation IDs for tracing requests

**Error Tracking:**
- Sentry for production errors
- Environment-specific dashboards
- Alert rules for critical issues

---

### Testing

**Unit Tests:** Jest

**Integration Tests:** Jest + SuperTest

**End-to-End:** Playwright (for critical user flows)

**Database:** Test containers with PostgreSQL

---

### API Documentation

**Tool:** Swagger/OpenAPI 3.0 with Zod schemas

**Integration:** Express middleware for auto-documentation

**Public Docs:** Hosted with ReDoc

---

### Development Tools

**Package Manager:** pnpm (same as frontend)

**Version Control:** Git with conventional commits

**Code Quality:**
- ESLint for linting
- Prettier for formatting
- Husky for pre-commit hooks
- SonarQube for code analysis (optional)

**Environment:** Docker for local development

---

## Database Architecture

### Database Schema

#### Core Tables

```
USERS
├─ id (UUID, PK)
├─ email (unique)
├─ username (unique)
├─ password_hash
├─ avatar_color
├─ created_at
├─ updated_at
└─ deleted_at (soft delete)

ROOMS
├─ id (VARCHAR(8), PK) - e.g., "abc12345"
├─ host_id (UUID, FK → users)
├─ movie_id (UUID, FK → movies)
├─ name
├─ status (enum: 'live', 'starting', 'ended', 'paused')
├─ is_private (boolean, default: true)
├─ created_at
├─ started_at
├─ ended_at
├─ current_playback_time (float)
├─ is_playing (boolean)
├─ created_at
├─ updated_at
└─ deleted_at (soft delete)

MOVIES
├─ id (UUID, PK)
├─ title
├─ genre
├─ year
├─ duration (string: "1h 52m")
├─ synopsis
├─ poster_url
├─ video_url (S3)
├─ video_duration (float, seconds)
├─ video_quality_options (JSON: [720p, 1080p, 4K])
├─ tmdb_id (external reference, nullable)
├─ imdb_id (external reference, nullable)
├─ created_at
├─ updated_at
└─ deleted_at

ROOM_PARTICIPANTS
├─ id (UUID, PK)
├─ room_id (VARCHAR(8), FK → rooms)
├─ user_id (UUID, FK → users)
├─ is_host (boolean)
├─ joined_at
├─ left_at (nullable)
├─ watch_start_time (float)
├─ watch_end_time (float)
├─ last_activity (timestamp)
├─ is_online (boolean)
└─ status (enum: 'active', 'idle', 'away')

MESSAGES
├─ id (UUID, PK)
├─ room_id (VARCHAR(8), FK → rooms)
├─ user_id (UUID, FK → users)
├─ content (text)
├─ created_at
├─ updated_at
├─ deleted_at (soft delete)
└─ reactions (JSON: {emoji: count})

PLAYBACK_EVENTS
├─ id (UUID, PK)
├─ room_id (VARCHAR(8), FK → rooms)
├─ user_id (UUID, FK → users)
├─ event_type (enum: 'play', 'pause', 'seek', 'quality_change')
├─ playback_time (float)
├─ created_at

WATCH_HISTORY
├─ id (UUID, PK)
├─ user_id (UUID, FK → users)
├─ movie_id (UUID, FK → movies)
├─ room_id (VARCHAR(8), FK → rooms, nullable)
├─ watched_at (timestamp)
├─ duration_watched (float)
└─ completed (boolean)

REFRESH_TOKENS
├─ id (UUID, PK)
├─ user_id (UUID, FK → users)
├─ token_hash
├─ expires_at
├─ created_at
├─ revoked_at (nullable)
└─ revoked_reason

SESSIONS
├─ id (UUID, PK)
├─ user_id (UUID, FK → users)
├─ ip_address
├─ user_agent
├─ created_at
├─ last_activity
└─ expires_at

NOTIFICATIONS
├─ id (UUID, PK)
├─ user_id (UUID, FK → users)
├─ type (enum: 'room_invite', 'user_joined', 'friend_started_room')
├─ title
├─ message
├─ data (JSON)
├─ read_at (nullable)
└─ created_at

ANALYTICS_EVENTS
├─ id (UUID, PK)
├─ user_id (UUID, nullable)
├─ event_name
├─ properties (JSON)
├─ timestamp
└─ session_id (UUID)
```

#### Indices & Optimizations

**Primary Indices:**
- `users(email)` - login lookup
- `rooms(host_id)` - user's rooms
- `rooms(created_at)` - recent rooms feed
- `room_participants(room_id, user_id)` - check membership
- `room_participants(user_id)` - user's active rooms
- `messages(room_id, created_at DESC)` - message history pagination
- `messages(user_id)` - user's messages
- `playback_events(room_id, created_at)` - sync timeline
- `watch_history(user_id, created_at DESC)` - user activity
- `sessions(user_id)` - active sessions

**Full-Text Search Indices:**
- `movies(title)` - FTS for discovery
- `messages(content)` - FTS for search

**Time-Series Optimization:**
- `playback_events` partitioned by month (if >100M rows)
- `analytics_events` partitioned by month

---

### Database Relationships

```
users
  ├─→ rooms (host_id)
  ├─→ room_participants
  ├─→ messages
  ├─→ playback_events
  ├─→ watch_history
  ├─→ refresh_tokens
  ├─→ sessions
  ├─→ notifications
  └─→ analytics_events

rooms
  ├─→ users (host_id)
  ├─→ movies
  ├─→ room_participants
  ├─→ messages
  ├─→ playback_events
  └─→ watch_history

movies
  ├─→ rooms
  └─→ watch_history

room_participants
  ├─→ users
  ├─→ rooms

messages
  ├─→ users
  ├─→ rooms
```

---

### Data Consistency Strategy

**Strong Consistency Requirements:**
- Room state (playing, paused, seek time)
- User authentication/authorization
- Message history
- Room membership

**Eventual Consistency OK:**
- Participant online status
- Watch history aggregates
- Analytics data
- Notification delivery

**Implementation:**
- Transactions for critical operations
- Message queue for non-critical updates
- Cache invalidation patterns
- Event sourcing for audit trail (optional)

---

## Authentication & Authorization

### Authentication Flow

#### Sign Up

```
1. User submits email + password
   ↓
2. Backend validates input (email format, password strength)
   ↓
3. Check email not already registered
   ↓
4. Hash password (bcrypt, 12 rounds)
   ↓
5. Create user record
   ↓
6. Send verification email
   ↓
7. Return success, user not yet verified
```

#### Login

```
1. User submits email + password
   ↓
2. Find user by email
   ↓
3. Compare password hash
   ↓
4. Generate JWT tokens (access + refresh)
   ↓
5. Create session record
   ↓
6. Return access token + set refresh cookie
```

#### Token Management

**Access Token:**
- JWT, 15 minutes expiry
- Contains: user_id, email, roles
- Stored in memory (frontend)
- Validated on every protected request

**Refresh Token:**
- JWT, 7 days expiry
- Stored in httpOnly, secure cookie
- One-time use (invalidated after use)
- Used to get new access token

**Invalidation Strategy:**
- Refresh tokens stored in `refresh_tokens` table
- Mark as revoked on logout
- Periodic cleanup (cron job)

---

### Authorization Model

**Role-Based Access Control (RBAC)**

```
Roles:
├─ user (default)
├─ moderator (can delete messages, ban users)
└─ admin (full system access)

Permissions (by role):
├─ user:
│  ├─ create_room
│  ├─ join_room
│  ├─ send_message
│  ├─ update_own_profile
│  └─ watch_movie
│
├─ moderator:
│  ├─ user permissions +
│  ├─ delete_message
│  ├─ warn_user
│  ├─ suspend_room
│  └─ view_reports
│
└─ admin:
   └─ all permissions
```

**Fine-Grained Authorization:**

- Room host can: kick participants, close room, change settings
- Message author can: edit own message, delete own message
- Participant can: send messages, watch, leave
- Guests cannot: modify anything

**Implementation:**
- Middleware for role checking
- Database checks for resource ownership
- Guard decorators on routes
- Policy engine for complex rules

---

### OAuth2 Integration (Social Login)

**Providers:**
- Google
- GitHub

**Flow:**
```
1. Frontend redirects to provider
   ↓
2. User logs in at provider
   ↓
3. Provider redirects to callback URL with code
   ↓
4. Backend exchanges code for tokens
   ↓
5. Backend fetches user profile
   ��
6. Check if user exists, create if not
   ↓
7. Generate Lumio tokens
   ↓
8. Redirect to app with session
```

**Database:**
- `oauth_accounts` table linking provider accounts to users
- Support multiple OAuth providers per user

---

## API Structure

### API Versioning

**Strategy:** URL-based versioning (`/api/v1/`, `/api/v2/`)

**Rationale:**
- Clear separation between versions
- Easy to run multiple versions simultaneously
- Sunset old versions with notice

---

### REST API Endpoints

#### Authentication Routes

```
POST /api/v1/auth/register
  Body: { email, password, username }
  Response: 201 Created

POST /api/v1/auth/login
  Body: { email, password }
  Response: 200 { access_token, user }

POST /api/v1/auth/logout
  Response: 204 No Content

POST /api/v1/auth/refresh
  Body: { } (uses refresh cookie)
  Response: 200 { access_token }

POST /api/v1/auth/oauth/:provider/callback
  Query: code, state
  Response: 302 redirect with session

POST /api/v1/auth/verify-email
  Body: { token }
  Response: 200 OK

POST /api/v1/auth/forgot-password
  Body: { email }
  Response: 200 OK

POST /api/v1/auth/reset-password
  Body: { token, password }
  Response: 200 OK

GET /api/v1/auth/me
  Response: 200 { user }
```

#### Room Routes

```
GET /api/v1/rooms
  Query: status, limit, offset
  Response: 200 { rooms: [], total: int }

POST /api/v1/rooms
  Body: { movie_id, name, is_private }
  Response: 201 { room }

GET /api/v1/rooms/:id
  Response: 200 { room, participants: [], current_movie: {} }

PUT /api/v1/rooms/:id
  Body: { name, is_private } (host only)
  Response: 200 { room }

DELETE /api/v1/rooms/:id
  Response: 204 (host only)

POST /api/v1/rooms/:id/join
  Body: { }
  Response: 200 { room }

POST /api/v1/rooms/:id/leave
  Body: { }
  Response: 204

GET /api/v1/rooms/:id/participants
  Response: 200 { participants: [] }

POST /api/v1/rooms/:id/participants/:user_id/kick
  Response: 204 (host only)

POST /api/v1/rooms/:id/playback/play
  Body: { current_time }
  Response: 200 (broadcast via WebSocket)

POST /api/v1/rooms/:id/playback/pause
  Body: { current_time }
  Response: 200 (broadcast via WebSocket)

POST /api/v1/rooms/:id/playback/seek
  Body: { current_time }
  Response: 200 (broadcast via WebSocket)

GET /api/v1/rooms/:id/playback/sync
  Response: 200 { current_time, is_playing, synced_at }
```

#### Movie Routes

```
GET /api/v1/movies
  Query: genre, year, search, limit, offset
  Response: 200 { movies: [], total: int }

GET /api/v1/movies/:id
  Response: 200 { movie }

GET /api/v1/movies/:id/stream
  Query: quality (720p, 1080p, 4K)
  Response: 302 redirect to S3 presigned URL
```

#### Chat Routes

```
GET /api/v1/rooms/:id/messages
  Query: limit, offset
  Response: 200 { messages: [], total: int }

POST /api/v1/rooms/:id/messages
  Body: { content }
  Response: 201 { message } (broadcast via WebSocket)

PUT /api/v1/rooms/:id/messages/:message_id
  Body: { content }
  Response: 200 { message } (broadcast via WebSocket)

DELETE /api/v1/rooms/:id/messages/:message_id
  Response: 204 (broadcast via WebSocket)

POST /api/v1/rooms/:id/messages/:message_id/react
  Body: { emoji }
  Response: 200 { message } (broadcast via WebSocket)
```

#### User Routes

```
GET /api/v1/users/:id
  Response: 200 { user }

PUT /api/v1/users/me
  Body: { username, avatar_color }
  Response: 200 { user }

GET /api/v1/users/me/watch-history
  Query: limit, offset
  Response: 200 { history: [] }

GET /api/v1/users/me/sessions
  Response: 200 { sessions: [] }

DELETE /api/v1/users/me/sessions/:session_id
  Response: 204

POST /api/v1/users/me/change-password
  Body: { old_password, new_password }
  Response: 200 OK
```

#### Admin Routes

```
GET /api/v1/admin/users
  Query: limit, offset, search
  Response: 200 { users: [], total: int }

POST /api/v1/admin/users/:id/suspend
  Body: { reason, duration }
  Response: 200

POST /api/v1/admin/users/:id/unsuspend
  Response: 200

GET /api/v1/admin/rooms
  Query: status, limit, offset
  Response: 200 { rooms: [], total: int }

POST /api/v1/admin/rooms/:id/close
  Body: { reason }
  Response: 200

GET /api/v1/admin/analytics
  Query: start_date, end_date
  Response: 200 { stats: {} }
```

---

### Folder Structure

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # PostgreSQL connection
│   │   ├── redis.ts             # Redis connection
│   │   ├── socketio.ts          # WebSocket config
│   │   ├── auth.ts              # JWT config
│   │   └── env.ts               # Environment validation
│   │
│   ├── middleware/
│   │   ├── auth.ts              # JWT verification
│   │   ├── authorize.ts         # Role/permission checks
│   │   ├── errorHandler.ts      # Global error handling
│   │   ├── requestLogger.ts     # Request logging
│   │   ├── rateLimiter.ts       # Rate limiting
│   │   ├── corsHandler.ts       # CORS configuration
│   │   └── validation.ts        # Request validation
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── room.controller.ts
│   │   ├── movie.controller.ts
│   │   ├── chat.controller.ts
│   │   ├── user.controller.ts
│   │   └── admin.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── room.service.ts
│   │   ├── movie.service.ts
│   │   ├── chat.service.ts
│   │   ├── user.service.ts
│   │   ├── playback.service.ts
│   │   ├── email.service.ts
│   │   └── analytics.service.ts
│   │
│   ├── repositories/
│   │   ├── user.repository.ts
│   │   ├── room.repository.ts
│   │   ├── message.repository.ts
│   │   ├── movie.repository.ts
│   │   ├── participant.repository.ts
│   │   └── base.repository.ts   # Base class
│   │
│   ├── websocket/
│   │   ├── events/
│   │   │   ├── playback.events.ts
│   │   │   ├── chat.events.ts
│   │   │   ├── presence.events.ts
│   │   │   └── sync.events.ts
│   │   ├── handlers/
│   │   │   ├── playback.handler.ts
│   │   │   ├── chat.handler.ts
│   │   │   └── sync.handler.ts
│   │   ├── middleware/
│   │   │   ├── authSocket.ts
│   │   │   └── roomSocket.ts
│   │   └── gateway.ts           # Socket.IO setup
│   │
│   ├── jobs/
│   │   ├── videoTranscode.job.ts
│   │   ├── roomCleanup.job.ts
│   │   ├── emailNotification.job.ts
│   │   ├── analyticsAggregate.job.ts
│   │   └── queue.ts             # Bull setup
│   │
│   ├── utils/
│   │   ├── jwt.ts               # JWT generation/verification
│   │   ├── hash.ts              # Password hashing
│   │   ├── validation.ts        # Input validation schemas
│   │   ├── errors.ts            # Custom error classes
│   │   ├── logger.ts            # Winston logger
│   │   ├── constants.ts         # App constants
│   │   └── helpers.ts           # Utility functions
│   │
│   ├── types/
│   │   ├── express.d.ts         # Express type augmentation
│   │   ├── user.ts
│   │   ├── room.ts
│   │   ��── message.ts
│   │   ├── movie.ts
│   │   └── index.ts             # Re-exports
│   │
│   ├── database/
│   │   ├── prisma/
│   │   │   ├── schema.prisma    # Data model
│   │   │   ├── seed.ts          # Database seeding
│   │   │   └── migrations/      # Auto-generated
│   │   └── scripts/
│   │       ├── init.ts          # Initialize DB
│   │       └── backup.ts        # Backup script
│   │
│   ├── routes/
│   │   ├── index.ts             # Route aggregation
│   │   ├── auth.routes.ts
│   │   ├── room.routes.ts
│   │   ├── movie.routes.ts
│   │   ├── chat.routes.ts
│   │   ├── user.routes.ts
│   │   └── admin.routes.ts
│   │
│   └── app.ts                   # Express app setup
│
├── tests/
│   ├── unit/
│   │   ├── services/
│   │   ├── utils/
│   │   └── repositories/
│   ├── integration/
│   │   ├── auth.test.ts
│   │   ├── room.test.ts
│   │   ├── chat.test.ts
│   │   └── playback.test.ts
│   └── fixtures/
│       ├── users.ts
│       ├── rooms.ts
│       └── movies.ts
│
├── docs/
│   ├── API.md                   # API documentation
│   ├── WEBSOCKET.md             # WebSocket events
│   ├── DATABASE.md              # Schema documentation
│   └── DEPLOYMENT.md            # Deploy guide
│
├── .env.example
├── .env.test
├── .env.production
├── docker-compose.yml
├── Dockerfile
├── tsconfig.json
├── package.json
├── jest.config.js
├── .eslintrc.json
├── .prettierrc
├── prisma.schema
└── README.md
```

---

## Real-Time Architecture

### WebSocket Events

**Namespace:** `/rooms/:roomId`

#### Playback Events

```
Event: playback:play
  Emit by: Client
  Broadcast to: All room participants
  Payload: { userId, currentTime, timestamp }
  Effect: All clients sync video to currentTime

Event: playback:pause
  Emit by: Client
  Broadcast to: All room participants
  Payload: { userId, currentTime, timestamp }
  Effect: All clients pause at currentTime

Event: playback:seek
  Emit by: Client
  Broadcast to: All room participants
  Payload: { userId, targetTime, timestamp }
  Effect: All clients seek to targetTime

Event: playback:quality-change
  Emit by: Client
  Broadcast to: User only
  Payload: { quality, timestamp }
  Effect: Quality selector updates

Event: sync:request
  Emit by: Client (on connect or every 30s)
  Respond with: Server sends sync state
  Payload: { currentTime, isPlaying, serverTime }
  Effect: Client adjusts playback to match server
```

#### Chat Events

```
Event: chat:message
  Emit by: Client
  Broadcast to: All room participants
  Payload: { userId, content, timestamp }
  Effect: Message saved and displayed

Event: chat:message-edit
  Emit by: Client
  Broadcast to: All room participants
  Payload: { messageId, content, editedAt }
  Effect: Message updated for all users

Event: chat:message-delete
  Emit by: Client
  Broadcast to: All room participants
  Payload: { messageId }
  Effect: Message removed for all users

Event: chat:react
  Emit by: Client
  Broadcast to: All room participants
  Payload: { messageId, emoji, userId }
  Effect: Reaction added/removed

Event: chat:typing
  Emit by: Client
  Broadcast to: All room participants (throttled)
  Payload: { userId }
  Effect: Show "User is typing..." indicator
```

#### Presence Events

```
Event: presence:join
  Emit by: Server (on connection)
  Broadcast to: All room participants
  Payload: { userId, userName, avatar, timestamp }
  Effect: User appears in participant list

Event: presence:leave
  Emit by: Server (on disconnect)
  Broadcast to: All room participants
  Payload: { userId, timestamp }
  Effect: User removed from participant list

Event: presence:activity
  Emit by: Client (on any action)
  Broadcast to: Server only
  Payload: { timestamp }
  Effect: Update last_activity, prevent idle timeout

Event: presence:status
  Emit by: Client
  Broadcast to: All room participants
  Payload: { userId, status: 'active' | 'idle' | 'away' }
  Effect: Status indicator updates
```

#### Sync Events

```
Event: sync:state
  Emit by: Server (on demand)
  Send to: Requesting client
  Payload: {
    currentTime: float,
    isPlaying: boolean,
    movieId: string,
    participants: [],
    messageCount: int,
    timestamp: date
  }
  Effect: Client reconciles state with server

Event: sync:conflict
  Emit by: Server
  Send to: All room participants
  Payload: { reason, suggestedTime }
  Effect: Show warning, auto-correct if agreed

Event: room:closed
  Emit by: Server
  Broadcast to: All room participants
  Payload: { reason }
  Effect: Disconnect all, redirect to rooms page
```

### WebSocket Architecture

```
Client
  ↓ (open connection to /rooms/:roomId)
Socket.IO Gateway
  ↓ (authenticate user)
Middleware Chain
  ├─ Auth verification
  ├─ Room membership check
  └─ Rate limiting
  ↓
Event Handlers
  ├─ Playback handler
  ├─ Chat handler
  ├─ Presence handler
  └─ Sync handler
  ↓
Services
  ├─ Playback service (update DB)
  ├─ Chat service (save message)
  ├─ Participant service (update status)
  └─ Sync service (calculate state)
  ↓
Broadcast
  ├─ To room (all participants)
  ├─ To user (private updates)
  └─ To server queue (events)
```

### Scalability: Redis Adapter

**Problem:** WebSocket connections are stateful, can't be load balanced

**Solution:** Socket.IO + Redis Adapter

```
Load Balancer (Round-robin)
  ├─ Server 1 (Socket.IO + Redis adapter)
  ├─ Server 2 (Socket.IO + Redis adapter)
  └─ Server 3 (Socket.IO + Redis adapter)
       ↓
  Redis (event hub)
       ↓
  Broadcasts go through Redis to all servers
```

**Implementation:**
- Redis pub/sub for events
- Socket.IO rooms stored in Redis
- Session affinity not required

---

## Caching Strategy

### Cache Layers

#### Layer 1: Browser (Frontend)

- Stale-while-revalidate for movie lists
- SessionStorage for room state during session
- LocalStorage for user preferences

#### Layer 2: HTTP Cache Headers

```
GET /api/v1/movies
  Response headers:
    Cache-Control: public, max-age=3600
    ETag: "hash..."

GET /api/v1/movies/:id/stream
  Response headers:
    Cache-Control: public, max-age=86400
    ETag: "hash..."

GET /api/v1/rooms/:id
  Response headers:
    Cache-Control: private, max-age=60
    ETag: "hash..."
```

#### Layer 3: Redis Cache

**Data to Cache:**

```
movies:list
  Key: "movies:list:{genre}:{page}"
  TTL: 1 hour
  Invalidate: On movie add/edit/delete

movies:{id}
  Key: "movies:{id}"
  TTL: 24 hours
  Invalidate: On update

rooms:{id}
  Key: "rooms:{id}"
  TTL: 10 minutes
  Invalidate: On room update

user:profile:{id}
  Key: "user:profile:{id}"
  TTL: 1 hour
  Invalidate: On user update

active_rooms
  Key: "active_rooms"
  TTL: 5 minutes
  Invalidate: On room creation/close

movie_trending
  Key: "movie_trending:{period}"
  TTL: 6 hours
  Compute: From analytics
```

**Cache Strategies:**

```
Cache-Aside (Lazy Loading):
1. Check cache
2. If miss, fetch from DB
3. Store in cache
4. Return

Write-Through:
1. Write to DB
2. Write to cache
3. Return

Write-Behind (Async):
1. Write to cache
2. Return immediately
3. Async write to DB
   (for non-critical data)
```

### Cache Invalidation

**Patterns:**

```
On user update:
  - Invalidate user:profile:{id}
  - Invalidate user:watch_history:{id}
  - Broadcast WebSocket event

On room update:
  - Invalidate rooms:{id}
  - Invalidate active_rooms
  - Broadcast WebSocket event

On message add:
  - Invalidate rooms:{id} (message count)
  - DO NOT cache messages (always fresh)
  - Broadcast WebSocket event
```

---

## Storage & Media

### Video Storage

**Provider:** AWS S3 (or MinIO for self-hosted)

**Bucket Structure:**

```
s3://lumio-videos/
├── movies/
│   ├── {movie_id}/
│   │   ├── original.mp4
│   │   ├── 720p.mp4
│   │   ├── 1080p.mp4
│   │   ├── 4k.mp4
│   │   ├── preview.jpg
│   │   └── thumbnail.jpg
│   └── ...
│
└── uploads/
    ├── {user_id}/
    │   ├── avatar.jpg
    │   └── ...
```

**CDN:** CloudFront (or Cloudflare)

- Distribute globally
- Cache video segments
- DRM-ready (future)

### Presigned URLs

**Flow:**

```
Client requests video
  ↓
Server validates access
  ↓
Server generates presigned URL (15 min expiry)
  ↓
Client redirected to S3/CloudFront
  ↓
Client streams directly from CDN
  ↓
No bandwidth through server
```

### Media Processing

**Pipeline for movie uploads:**

```
1. Upload to S3 (original)
   ↓
2. Queue transcoding job
   ↓
3. Transcode to multiple qualities
   ├─ 720p (1500 kbps)
   ├─ 1080p (4500 kbps)
   └─ 4K (15000 kbps)
   ↓
4. Generate thumbnails/previews
   ↓
5. Update movie record in DB
   ↓
6. Cleanup temporary files
```

**Jobs:** Using Bull queue, processed by separate worker service

---

## Background Jobs

### Job Queue (Bull + Redis)

**Jobs to Queue:**

```
email:send-verification
  Trigger: User signup
  Delay: Immediate
  Retry: 3 times (exponential backoff)
  Priority: High

email:send-password-reset
  Trigger: Forgot password request
  Delay: Immediate
  Retry: 3 times
  Priority: High

email:room-invitation
  Trigger: User invites friend
  Delay: Immediate
  Retry: 2 times
  Priority: Normal

video:transcode
  Trigger: Movie upload
  Delay: Immediate
  Retry: 1 time
  Priority: Normal
  Concurrency: 2 (resource intensive)

room:cleanup
  Trigger: Scheduled (every 1 hour)
  Remove: Rooms with no participants for >2 hours
  Delete: Old closed rooms (>30 days)
  Priority: Low

analytics:aggregate
  Trigger: Scheduled (every 6 hours)
  Compute: Watch time, popular movies, active users
  Store: Aggregated results in analytics table
  Priority: Low

notification:send
  Trigger: Events (user joined room, friend started watching)
  Delay: Immediate
  Retry: 2 times
  Priority: Normal

backup:database
  Trigger: Scheduled (daily at 2 AM)
  Task: Full DB dump to S3
  Retention: 30 days
  Priority: Low

cache:warmup
  Trigger: Scheduled (every 30 min)
  Task: Refresh popular data in cache
  Priority: Low
```

### Job Monitoring

**Tools:**
- Bull Dashboard (web UI at `/admin/jobs`)
- Logs to Winston logger
- Alerts via Sentry on failures
- Retry strategy with exponential backoff

---

## Deployment Architecture

### Environment Stages

```
Development
  ├─ Local PostgreSQL
  ├─ Local Redis
  ├─ Local S3 (MinIO)
  ├─ No auth checks (dev mode)
  └─ Seed data auto-loaded

Staging
  ├─ RDS PostgreSQL (t3.medium)
  ├─ ElastiCache Redis (t3.micro)
  ├─ S3 for media
  ├─ Full auth enabled
  ├─ Docker containers
  └─ Simulates production

Production
  ├─ RDS PostgreSQL (t3.large, Multi-AZ)
  ├─ ElastiCache Redis (r6g.large, Multi-AZ)
  ├─ S3 for media (encrypted)
  ├─ CloudFront CDN
  ├─ Full auth, rate limiting
  ├─ Kubernetes cluster (ECS)
  ├─ Load balancer (ALB)
  └─ Auto-scaling group (1-10 instances)
```

### Deployment Stack

**Infrastructure as Code:**
- Terraform for AWS resources
- Docker Compose for local dev
- Kubernetes manifests for production

**Container Orchestration:**
- Docker for all services
- Docker Compose for dev
- AWS ECS for production (or Kubernetes)

**CI/CD Pipeline:**

```
GitHub Push
  ↓
GitHub Actions (or CircleCI)
  ├─ Lint & format check
  ├─ Run tests
  │   ├─ Unit tests
  │   ├─ Integration tests
  │   └─ E2E tests
  ├─ Build Docker image
  ├─ Push to ECR
  └─ Deploy to staging
       ↓
  Manual approval
       ↓
  Deploy to production
       ├─ Rolling update (0 downtime)
       ├─ Health checks
       ├─ Smoke tests
       └─ Rollback on failure
```

### Monitoring & Observability

**Metrics (Prometheus):**
- Request latency (p50, p95, p99)
- Error rates
- Database connection pool usage
- Redis memory usage
- WebSocket connection count
- Job queue depth

**Logs (CloudWatch + Winston):**
- Structured JSON logs
- Correlation IDs across services
- Log levels: debug, info, warn, error
- Retention: 30 days

**Tracing (Jaeger):**
- Distributed tracing for requests
- Trace complex operations
- Identify bottlenecks

**Alerting (PagerDuty + Sentry):**
- Error rate > 1%
- Latency p95 > 1000ms
- Database connection pool nearly full
- Redis memory > 80%
- Job queue backup

---

## Security

### Authentication & Authorization

✓ JWT with secure refresh token rotation  
✓ Password hashing (bcrypt)  
✓ HTTPS/TLS everywhere  
✓ CORS properly configured  
✓ Rate limiting (10 req/sec per IP)  
✓ Login attempt throttling (5 attempts/hour)  
✓ Session expiry (24 hours)  
✓ CSRF protection (if using cookies)  

### Data Protection

✓ Encryption at rest (RDS encryption)  
✓ Encryption in transit (TLS 1.3)  
✓ Password hashing (bcrypt, 12 rounds)  
✓ API keys/secrets in environment variables  
✓ Sensitive data PII masking in logs  
✓ Database credentials managed by AWS Secrets Manager  

### API Security

```
Input Validation:
├─ Zod schemas for all requests
├─ SQL injection prevention (parameterized queries)
├─ NoSQL injection prevention (if applicable)
├─ XSS prevention (output encoding)
└─ CSRF tokens (if using cookies)

Rate Limiting:
├─ Global: 1000 req/min per IP
├─ Auth: 5 failed logins/hour
├─ Video stream: 50 req/min per user
├─ Chat: 100 messages/hour per user
└─ Bypass for premium (future)

Request Size Limits:
├─ JSON body: 1 MB
├─ Message content: 5000 characters
├─ File upload: 500 MB (video)
└─ API response: Pagination required (max 1000 items)
```

### Access Control

```
Room-Level:
├─ Participants can only access own room data
├─ Hosts can modify room settings
├─ Non-members cannot access private rooms
└─ Messages only visible to room participants

Message-Level:
├─ Users can edit own messages
├─ Users can delete own messages
├─ Moderators can delete any message
├─ Admins can restore deleted messages
└─ Messages immutable after 1 hour (edit window)

Admin-Level:
├─ Admins can see analytics dashboard
├─ Admins can suspend/unsuspend users
├─ Admins can close rooms
└─ All admin actions logged for audit
```

### Security Headers

```
HTTP Response Headers:
├─ Strict-Transport-Security: max-age=31536000
├─ X-Content-Type-Options: nosniff
├─ X-Frame-Options: DENY
├─ X-XSS-Protection: 1; mode=block
├─ Content-Security-Policy: restrictive
├─ Referrer-Policy: strict-origin-when-cross-origin
└─ Permissions-Policy: geolocation=(), microphone=()
```

### Audit Logging

```
Events to Log:
├─ User authentication (login, logout, password change)
├─ Room creation/deletion (who, when)
├─ Admin actions (suspend user, delete room)
├─ API errors (what, when, who)
├─ Database schema changes
├─ Deploy events
└─ Security alerts
```

---

## Scalability Strategy

### Horizontal Scaling

**Stateless API Servers:**
- All requests can go to any server
- Session state in Redis
- Load balanced via ALB

**Auto-scaling Rules:**
- Scale up: CPU > 70% for 2 minutes
- Scale down: CPU < 30% for 10 minutes
- Min: 2 instances (high availability)
- Max: 10 instances (cost control)

**Load Balancing:**
- Application Load Balancer (AWS ALB)
- Health checks every 30 seconds
- Sticky sessions (for WebSocket)
- Round-robin with least connections

### Database Scaling

**Read Replicas:**
- Primary: RDS PostgreSQL (t3.large)
- Read replicas: 2x (for analytics/reporting)
- Replication lag: <1 second

**Partitioning:**
- `playback_events`: Partitioned by month (>1M rows)
- `analytics_events`: Partitioned by month (>1M rows)
- Other tables: No partitioning needed initially

**Connection Pooling:**
- PgBouncer: 50 connections per app server
- Total pool: 500 connections (10 servers)

**Query Optimization:**
- Database indices on all JOINs
- Query execution plan reviews (EXPLAIN)
- Slow query logging (>500ms)

### Cache Scaling

**Redis:**
- Single node: 10GB (handles 90% of cache)
- Cluster mode: If >50GB needed
- Persistence: RDB snapshots + AOF (optional)

### Media Scaling

**CDN:**
- CloudFront with 50+ edge locations globally
- Cache video segments for 30 days
- Automatic compression (gzip, brotli)

**S3:**
- Auto-scaling (unlimited)
- Lifecycle policies: Archive to Glacier after 90 days
- Versioning enabled for rollback

### WebSocket Scaling

**Redis Adapter:**
- All events published to Redis
- Rooms span multiple servers seamlessly
- Max 10,000 concurrent connections per server
- Supports 100,000 concurrent users on 10 servers

---

## Development Roadmap

### Sprint Structure

**Duration:** 2 weeks per sprint  
**Team:** 2-3 developers  
**Ceremonies:**
- Daily standups (15 min)
- Sprint planning (2 hours)
- Mid-sprint review (1 hour)
- Sprint retrospective (1 hour)
- Demo (1 hour)

**Definition of Done:**
- Code reviewed and approved
- Tests written (unit + integration)
- Database migrations tested
- API documentation updated
- No console errors or warnings
- Manual QA passed
- Deployed to staging

---

## Sprint 1: Foundation & Auth (Weeks 1-2)

### Goals
- Backend server up and running
- Database schema created
- User authentication working
- API skeleton in place
- Deployment pipeline ready

### Deliverables

**Infrastructure:**
- Express.js server scaffold
- PostgreSQL database setup (local + RDS)
- Redis setup (local + ElastiCache)
- Docker configuration (Dockerfile + docker-compose)
- GitHub Actions CI/CD pipeline
- Terraform code for AWS resources
- Environment configuration (.env, secrets management)

**Database:**
- Prisma schema design (all 11 tables)
- Database migrations
- Seed data script
- Connection pooling config

**Authentication:**
- User registration endpoint
- Login endpoint (JWT)
- Token refresh endpoint
- Logout endpoint
- Email verification (stub, no sending yet)
- Password reset flow (stub)
- OAuth2 setup (Google/GitHub, redirects only)

**API Structure:**
- REST API versioning (/api/v1/)
- Error handling middleware
- Request logging middleware
- CORS configuration
- Rate limiting (basic)
- Input validation (Zod schemas)
- API documentation (Swagger setup)

**Testing:**
- Jest configuration
- Test database setup
- Authentication tests
- Basic API tests

**Documentation:**
- Architecture decision records (ADRs)
- API endpoint list (with curl examples)
- Database schema documentation
- Deployment guide (local setup)

### Not Included
- WebSocket (real-time)
- Room management APIs
- Movie database
- Chat functionality

---

## Sprint 2: Room Management (Weeks 3-4)

### Goals
- Core room functionality
- Room creation/joining/leaving
- Participant management
- Room state persistence
- Active rooms listing

### Deliverables

**Room APIs:**
- Create room endpoint
- Get room endpoint
- List rooms (with filtering)
- Update room (host only)
- Delete room (host only)
- Join room endpoint
- Leave room endpoint
- Room validation (existence, access)

**Participant APIs:**
- List room participants
- Kick participant (host only)
- Get participant status
- Update participant status

**Services:**
- Room service (create, join, leave logic)
- Participant service (add, remove, update)
- Room validation service
- Room cleanup service

**Database:**
- Room creation timestamps
- Participant tracking
- Host validation
- Room status transitions

**Caching:**
- Cache active rooms list
- Cache room details
- Cache invalidation on room changes

**Testing:**
- Room creation tests
- Room joining tests
- Room access control tests
- Participant management tests

**Documentation:**
- Room endpoints documentation
- Room state machine diagram
- Join flow diagram

### Not Included
- WebSocket sync
- Video playback state
- Chat

---

## Sprint 3: WebSocket & Real-Time Sync (Weeks 5-6)

### Goals
- Real-time architecture in place
- Playback synchronization
- Presence tracking
- Event broadcasting
- Connection management

### Deliverables

**WebSocket Infrastructure:**
- Socket.IO setup and configuration
- Redis adapter for scaling
- WebSocket authentication middleware
- Room join/leave handlers
- Connection tracking

**Playback Events:**
- Play event handler
- Pause event handler
- Seek event handler
- Quality change handler
- Sync state calculation
- Sync response sender
- Playback state persistence

**Presence Tracking:**
- User join event
- User leave event
- Activity tracking (update last_activity)
- Status changes (active/idle/away)
- Online participant list

**Event Broadcasting:**
- Broadcast to room
- Broadcast to user only
- Broadcast to admin only
- Event queuing for persistence

**Services:**
- Sync service (calculate state)
- Presence service (user status)
- Event service (broadcast, queue)

**Testing:**
- WebSocket connection tests
- Playback event tests
- Presence tracking tests
- Event broadcast tests
- Stress tests (100 users in room)

**Documentation:**
- WebSocket events documentation
- Real-time architecture diagram
- Event flow diagrams

### Not Included
- Chat messages
- Video streaming
- Movies database

---

## Sprint 4: Chat & Messages (Weeks 7-8)

### Goals
- Message persistence
- Chat functionality
- Message history
- Real-time chat sync
- Message reactions

### Deliverables

**Chat APIs:**
- Send message endpoint
- Get messages endpoint (with pagination)
- Edit message endpoint
- Delete message endpoint
- React to message endpoint

**Chat WebSocket Events:**
- Message send event
- Message edit event
- Message delete event
- Reaction add event
- Typing indicator (throttled)

**Services:**
- Chat service (send, edit, delete)
- Message repository (queries)
- Reaction service
- Message history service

**Database:**
- Message persistence
- Reaction tracking
- Edit history (optional, for V2)
- Soft deletes for messages

**Caching:**
- Recent messages cache (per room)
- Cache invalidation on message changes

**Testing:**
- Message send tests
- Message edit tests
- Message delete tests
- Reaction tests
- Pagination tests
- Concurrent message tests

**Documentation:**
- Chat endpoints documentation
- Message model documentation

### Not Included
- Message search
- Message moderation
- Profanity filtering
- Message notifications

---

## Sprint 5: Movie Database & Video (Weeks 9-10)

### Goals
- Movie database populated
- Video streaming endpoint
- Movie listing & filtering
- Movie metadata
- CDN integration

### Deliverables

**Movie APIs:**
- List movies endpoint
- Get movie endpoint
- Search movies endpoint
- Filter by genre/year
- Pagination

**Movie Management:**
- Movie admin upload endpoint (future, stub now)
- Update movie metadata endpoint
- Delete movie endpoint

**Video Streaming:**
- Presigned S3 URL generation
- Quality selection
- Stream redirect endpoint
- CDN integration (CloudFront)

**Services:**
- Movie service (CRUD)
- Video service (presigned URLs, CDN)
- Storage service (S3 interaction)

**Database:**
- Movie records (25-50 test movies)
- Video quality options
- Watch history tracking

**Infrastructure:**
- S3 bucket setup (with sample videos)
- CloudFront distribution
- Upload pipeline (for movies)

**Testing:**
- Movie listing tests
- Search tests
- Filter tests
- Presigned URL tests
- Stream tests (with mocked S3)

**Documentation:**
- Movie endpoints documentation
- Video streaming architecture
- S3 setup guide

### Not Included
- Video transcoding
- Thumbnail generation
- Advanced metadata (ratings, reviews)

---

## Sprint 6: Background Jobs & Analytics (Weeks 11-12)

### Goals
- Job queue operational
- Email notifications
- Analytics tracking
- Room cleanup automation
- Monitoring setup

### Deliverables

**Job Queue:**
- Bull setup and configuration
- Job persistence in Redis
- Job monitoring dashboard
- Failed job handling

**Background Jobs:**
- Email verification job (stub implementation)
- Password reset email job
- Room cleanup job
- Analytics aggregation job
- Database backup job

**Email Service:**
- Email template system
- Email configuration
- Send email function
- Email logging

**Analytics:**
- Analytics event tracking
- Event schema definition
- Aggregation queries
- Analytics dashboard queries

**Monitoring & Logging:**
- Winston logger setup
- Structured JSON logging
- Log rotation
- Sentry integration (error tracking)
- CloudWatch logs integration
- Prometheus metrics setup
- Health check endpoints

**Services:**
- Email service
- Analytics service
- Job queue service
- Monitoring service

**Testing:**
- Job execution tests
- Email sending tests (mocked)
- Analytics aggregation tests
- Monitoring tests

**Documentation:**
- Job queue documentation
- Email template documentation
- Analytics events documentation
- Monitoring guide

### Not Included
- Advanced email (templating, MJML)
- Payment processing (future)
- Real video transcoding

---

## Sprint 7: Security, Admin, & MVP Polish (Weeks 13-14)

### Goals
- Security hardening
- Admin panel endpoints
- Testing coverage >80%
- Performance optimization
- Production readiness

### Deliverables

**Security Hardening:**
- Security headers configuration
- API rate limiting (tuned)
- Login attempt throttling
- CORS hardening
- CSRF protection (if needed)
- SQL injection prevention review
- XSS prevention review
- Audit logging implementation

**Admin APIs:**
- User suspension/unsuspension
- Room moderation
- Message deletion (by admin)
- Analytics dashboard queries
- Admin-only data access

**Authorization:**
- Role-based access control (RBAC)
- Permission matrix setup
- Admin vs. moderator vs. user
- Resource ownership validation

**Performance Optimization:**
- Database query optimization
- N+1 query fixes
- Caching strategy review
- Redis optimization
- CDN cache headers tuning

**Testing:**
- Unit tests (>70% coverage)
- Integration tests (key flows)
- API tests (all endpoints)
- Security tests (OWASP top 10)
- Load testing (1000 concurrent users)
- WebSocket stress testing

**Documentation:**
- Complete API documentation
- Deployment guide (production)
- Security audit results
- Performance benchmarks
- Architecture documentation
- Database schema documentation

**DevOps:**
- Production deployment to staging
- Smoke tests on staging
- Load testing in staging
- Security scanning
- Dependency vulnerability scanning

**Frontend Integration:**
- API contracts finalized
- Swagger documentation exported
- Frontend team receives docs
- Postman collection created
- Example requests documented

---

## Post-MVP (Not in Roadmap)

### Phase 2: Advanced Features
- User profiles & social features
- Room invitations & friend system
- Message search
- Message moderation & reporting
- Video transcoding at scale
- Advanced analytics dashboard
- Mobile app backend API adjustments

### Phase 3: Monetization
- Subscription tier management
- Payment processing (Stripe)
- Premium room features
- Ad integration
- Revenue analytics

### Phase 4: Scaling
- Kubernetes deployment
- Multi-region setup
- Database sharding
- Microservices split
- Service mesh (Istio)

---

## Resource Requirements

### Team

**Sprint 1-2:**
- 1x Backend Engineer (senior)
- 1x DevOps Engineer (part-time)

**Sprint 3-4:**
- 1x Backend Engineer (senior)
- 1x Backend Engineer (mid-level)
- 1x DevOps Engineer

**Sprint 5-7:**
- 2x Backend Engineers
- 1x DevOps Engineer
- 1x QA Engineer (automation)

### Infrastructure Costs (Monthly)

**Development:**
- Local: $0 (Docker Compose)

**Staging:**
- RDS PostgreSQL (t3.medium): $180
- ElastiCache Redis (t3.micro): $30
- S3 + CDN: $50
- EC2 (1x t3.medium): $50
- **Subtotal:** $310

**Production:**
- RDS PostgreSQL (t3.large, Multi-AZ): $500
- ElastiCache Redis (r6g.large, Multi-AZ): $400
- S3 + CloudFront: $200
- EC2 (4x t3.large): $400
- Load Balancer (ALB): $25
- NAT Gateway: $45
- Monitoring (Sentry, CloudWatch): $100
- **Subtotal:** $1,670

**Total:** ~$1,980/month for production

---

## Success Metrics

### By Sprint

**Sprint 1:** 
✓ API responding to requests  
✓ Authentication working  
✓ Zero deployment failures  

**Sprint 2:**
✓ Can create rooms and join  
✓ Room list shows active rooms  
✓ API tests pass  

**Sprint 3:**
✓ Play/pause synced across users  
✓ WebSocket connection stable  
✓ <500ms sync latency  

**Sprint 4:**
✓ Messages persist and display  
✓ Chat doesn't miss messages  
✓ Supports 20+ messages/second  

**Sprint 5:**
✓ Video streams without buffering  
✓ CDN reduces latency by 50%  
✓ All movies searchable  

**Sprint 6:**
✓ All jobs execute successfully  
✓ Monitoring captures all errors  
✓ Email sending works  

**Sprint 7:**
✓ Test coverage >80%  
✓ Load test: 1000 concurrent OK  
✓ Security audit: 0 critical issues  
✓ Ready for production  

---

## Summary

This backend architecture is designed to:
- **Scale horizontally** with stateless servers
- **Handle real-time** synchronization via WebSocket
- **Persist all data** safely in PostgreSQL
- **Optimize performance** with caching and CDN
- **Maintain security** at every layer
- **Support growth** to 100,000+ concurrent users

The 7-sprint roadmap delivers:
1. **Foundation** (auth, infrastructure)
2. **Core features** (rooms, chat, sync)
3. **Media** (video, movies)
4. **Operations** (jobs, monitoring)
5. **Polish** (security, testing, optimization)

By the end of Sprint 7, the backend is **production-ready** and can support the Lumio platform launch.

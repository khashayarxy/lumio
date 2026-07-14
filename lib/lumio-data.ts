export type Movie = {
  id: string
  title: string
  year: number
  genre: string
  duration: string
  poster: string
  synopsis: string
}

export const movies: Movie[] = [
  {
    id: 'neon-drift',
    title: 'Neon Drift',
    year: 2024,
    genre: 'Neo-noir',
    duration: '1h 52m',
    poster: '/posters/neon-drift.png',
    synopsis:
      'A courier navigates a rain-drenched city where every light hides a secret.',
  },
  {
    id: 'silent-orbit',
    title: 'Silent Orbit',
    year: 2023,
    genre: 'Sci-Fi',
    duration: '2h 08m',
    poster: '/posters/silent-orbit.png',
    synopsis:
      'Stranded above a dying planet, one astronaut fights to send a final message home.',
  },
  {
    id: 'golden-hour',
    title: 'Golden Hour',
    year: 2024,
    genre: 'Drama',
    duration: '1h 41m',
    poster: '/posters/golden-hour.png',
    synopsis:
      'Two strangers share a single evening that changes the course of their lives.',
  },
  {
    id: 'deep-woods',
    title: 'Deep Woods',
    year: 2022,
    genre: 'Thriller',
    duration: '1h 47m',
    poster: '/posters/deep-woods.png',
    synopsis:
      'A weekend retreat turns into a search for a light that should not exist.',
  },
  {
    id: 'last-light',
    title: 'Last Light',
    year: 2025,
    genre: 'Adventure',
    duration: '2h 15m',
    poster: '/posters/last-light.png',
    synopsis:
      'A final ascent under the aurora tests everything a climber believes in.',
  },
]

export type Participant = {
  id: string
  name: string
  color: string
  host?: boolean
}

export const participants: Participant[] = [
  { id: 'you', name: 'You', color: '#7C5CFF', host: true },
  { id: 'mina', name: 'Mina', color: '#53B8FF' },
  { id: 'arash', name: 'Arash', color: '#2ED47A' },
  { id: 'sara', name: 'Sara', color: '#FF5C7A' },
]

export type ChatMessage = {
  id: string
  author: string
  color: string
  text: string
  time: string
  self?: boolean
}

export const seedMessages: ChatMessage[] = [
  {
    id: 'm1',
    author: 'Mina',
    color: '#53B8FF',
    text: 'Okay everyone in? Starting in a sec.',
    time: '20:41',
  },
  {
    id: 'm2',
    author: 'Arash',
    color: '#2ED47A',
    text: 'Ready. This opening shot is unreal.',
    time: '20:42',
  },
  {
    id: 'm3',
    author: 'Sara',
    color: '#FF5C7A',
    text: 'Pause if anyone needs snacks!',
    time: '20:42',
  },
]

export function activeRooms() {
  return [
    {
      id: 'aurora',
      name: 'Friday Film Club',
      host: 'Mina',
      movie: movies[0],
      watching: 4,
      status: 'live' as const,
    },
    {
      id: 'orbit',
      name: 'Late Night Sci-Fi',
      host: 'Arash',
      movie: movies[1],
      watching: 2,
      status: 'live' as const,
    },
    {
      id: 'goldenroom',
      name: 'Cozy Sunday',
      host: 'Sara',
      movie: movies[2],
      watching: 6,
      status: 'live' as const,
    },
    {
      id: 'trail',
      name: 'Adventure Marathon',
      host: 'Kian',
      movie: movies[4],
      watching: 3,
      status: 'starting' as const,
    },
  ]
}

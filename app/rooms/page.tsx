import { SiteHeader } from '@/components/site-header'
import { RoomsLobby } from '@/components/rooms/rooms-lobby'

export default function RoomsPage() {
  return (
    <main className="min-h-screen bg-background">
      <SiteHeader />
      <RoomsLobby />
    </main>
  )
}

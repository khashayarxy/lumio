import { WatchRoom } from '@/components/room/watch-room'

export default async function RoomPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <main className="min-h-screen bg-background">
      <WatchRoom roomId={id} />
    </main>
  )
}

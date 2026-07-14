import { Clapperboard, MessageCircle, Radio, ShieldCheck, Sparkles, Users } from 'lucide-react'

const features = [
  {
    icon: Radio,
    title: 'Frame-perfect sync',
    body: 'Play, pause and seek together. Lumio keeps every screen aligned down to the second, no counting to three.',
    accent: 'primary',
  },
  {
    icon: MessageCircle,
    title: 'Chat that feels present',
    body: 'React in the moment with a calm, focused chat that stays out of the way until you need it.',
    accent: 'blue',
  },
  {
    icon: Users,
    title: 'Rooms for your people',
    body: 'Invite with a single code. See who is watching, who is muted, and who just walked in.',
    accent: 'success',
  },
  {
    icon: Clapperboard,
    title: 'A cinematic player',
    body: 'A distraction-free player designed around the film — controls appear only when you want them.',
    accent: 'primary',
  },
  {
    icon: ShieldCheck,
    title: 'Private by default',
    body: 'Rooms are yours. Share the code with friends and no one else can wander in.',
    accent: 'blue',
  },
  {
    icon: Sparkles,
    title: 'Premium, always',
    body: 'Every detail is tuned for a calm, elegant experience — from motion to typography to sound.',
    accent: 'success',
  },
]

const accentMap: Record<string, string> = {
  primary: 'text-primary bg-primary/10',
  blue: 'text-[#53B8FF] bg-[#53B8FF]/10',
  success: 'text-success bg-success/10',
}

export function Features() {
  return (
    <section id="features" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Built for the moment you press play
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            Everything about Lumio is designed to disappear, so the film and the
            people you are with take center stage.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="glass group rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-white/15"
            >
              <span
                className={`grid size-11 place-items-center rounded-2xl ${accentMap[f.accent]}`}
              >
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-medium text-foreground">{f.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

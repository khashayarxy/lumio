const steps = [
  {
    n: '01',
    title: 'Create a room',
    body: 'Start a private space in one tap. Lumio generates a code you can share anywhere.',
  },
  {
    n: '02',
    title: 'Invite your friends',
    body: 'Send the code. Everyone lands in the same room, ready and in sync.',
  },
  {
    n: '03',
    title: 'Press play together',
    body: 'One play button for the whole room. Chat, react, and enjoy the film as one.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
            Three steps to movie night
          </h2>
          <p className="mt-4 text-pretty text-lg leading-relaxed text-muted-foreground">
            No accounts to wrestle with, no settings to configure. Just you, your
            friends, and the film.
          </p>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="glass relative overflow-hidden rounded-3xl p-7">
              <span className="text-5xl font-semibold tracking-tight text-primary/25">
                {s.n}
              </span>
              <h3 className="mt-4 text-xl font-medium text-foreground">{s.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-muted-foreground">
                {s.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

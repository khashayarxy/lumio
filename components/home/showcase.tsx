import { movies } from '@/lib/lumio-data'

export function Showcase() {
  return (
    <section className="px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Bring your own film
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
              A curated feel for anything you watch. These are a few of the rooms
              lighting up tonight.
            </p>
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {movies.map((m) => (
            <div
              key={m.id}
              className="group relative aspect-[2/3] overflow-hidden rounded-2xl border border-border"
            >
              <img
                src={m.poster || '/placeholder.svg'}
                alt={`${m.title} poster`}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-sm font-medium text-foreground">{m.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {m.genre} · {m.year}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

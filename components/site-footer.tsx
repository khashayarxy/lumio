import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { LumioLogo } from '@/components/lumio-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SiteFooter() {
  return (
    <footer className="px-5 pb-10">
      <div className="mx-auto max-w-6xl">
        {/* CTA */}
        <div className="glass-strong brand-glow relative overflow-hidden rounded-3xl px-6 py-14 text-center md:py-20">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-0 -z-10 h-64 w-[600px] -translate-x-1/2 rounded-full opacity-50 blur-[110px]"
            style={{
              background:
                'radial-gradient(closest-side, rgba(124,92,255,0.5), transparent)',
            }}
          />
          <h2 className="mx-auto max-w-2xl text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Your next movie night starts here
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Create a room in seconds and gather your people. The film is better
            when you are watching it together.
          </p>
          <Link
            href="/rooms"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'mt-8 h-12 rounded-2xl px-6 text-base hover:bg-primary/90',
            )}
          >
            Start a room
            <ArrowRight className="size-5" />
          </Link>
        </div>

        {/* bottom */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <LumioLogo />
          <p className="text-sm text-muted-foreground">
            Watch together, in sync. Made for the moment.
          </p>
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/rooms" className="transition-colors hover:text-foreground">
              Rooms
            </Link>
            <Link href="/#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}

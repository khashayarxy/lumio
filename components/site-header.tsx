import Link from 'next/link'
import { LumioLogo } from '@/components/lumio-logo'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 w-full pt-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5">
        <div className="glass flex h-12 items-center gap-6 rounded-full pl-5 pr-3">
          <Link href="/" aria-label="Lumio home">
            <LumioLogo />
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="/rooms" className="transition-colors hover:text-foreground">
              Rooms
            </Link>
            <Link href="/#features" className="transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="/#how" className="transition-colors hover:text-foreground">
              How it works
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/rooms"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'lg' }),
              'hidden rounded-full px-4 text-muted-foreground hover:text-foreground sm:inline-flex',
            )}
          >
            Browse rooms
          </Link>
          <Link
            href="/rooms"
            className={cn(
              buttonVariants({ size: 'lg' }),
              'rounded-full px-4 hover:bg-primary/90',
            )}
          >
            Start watching
          </Link>
        </div>
      </div>
    </header>
  )
}

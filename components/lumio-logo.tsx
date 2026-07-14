import { cn } from '@/lib/utils'

export function LumioLogo({
  className,
  showWordmark = true,
}: {
  className?: string
  showWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="relative grid size-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-8px_rgba(124,92,255,0.8)]"
      >
        <span className="size-3 rounded-full bg-primary-foreground" />
        <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/20" />
      </span>
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Lumio
        </span>
      )}
    </span>
  )
}

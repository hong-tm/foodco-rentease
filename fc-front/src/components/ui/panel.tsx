import * as React from 'react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

/** The one surface of the app screens: a card with a hairline, no shadow. */
export function Panel({
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="panel"
      className={cn(
        'bg-card text-card-foreground flex min-w-0 flex-col gap-3 rounded-xl border p-4 md:p-5',
        className,
      )}
      {...props}
    />
  )
}

export function PanelHeader({
  title,
  meta,
  action,
  className,
}: {
  title: React.ReactNode
  meta?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <header
      className={cn(
        'flex min-w-0 items-start justify-between gap-3',
        className,
      )}
    >
      <div className="min-w-0">
        <h2 className="type-section">{title}</h2>
        {meta ? (
          <p className="type-meta text-muted-foreground mt-0.5">{meta}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </header>
  )
}

/** Failure inside the block that failed, with a way back. */
export function PanelError({
  what,
  onRetry,
}: {
  what: string
  onRetry?: () => void
}) {
  return (
    <p className="type-body text-muted-foreground flex flex-wrap items-center gap-x-2">
      Couldn't load {what}.
      {onRetry ? (
        <Button variant="quiet" onClick={onRetry}>
          Retry
        </Button>
      ) : null}
    </p>
  )
}

/** One sentence in the frame where rows or marks would be. */
export function PanelEmpty({ children }: { children: React.ReactNode }) {
  return (
    <p className="type-body text-muted-foreground rounded-lg border border-dashed px-3 py-2.5">
      {children}
    </p>
  )
}

export function PanelRowsSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full" />
      ))}
    </div>
  )
}

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type SpecCell = {
  label: string
  value: ReactNode
  anomaly?: boolean
}

type SpecStripProps = {
  value: string
  unit: string
  cells: SpecCell[]
}

// A value like "Curry Mee · 2026-11-04" keeps its date as one unbreakable
// unit: the tail moves to a second line instead of splitting mid-date.
function cellValue(value: ReactNode) {
  if (typeof value !== 'string') return value
  const at = value.indexOf(' · ')
  if (at === -1) return value
  return (
    <>
      {value.slice(0, at)}{' '}
      <span className="inline-block whitespace-nowrap">
        {value.slice(at + 1)}
      </span>
    </>
  )
}

export function SpecStrip({ value, unit, cells }: SpecStripProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-baseline gap-3">
        <span className="text-4xl leading-none font-light tracking-tighter tabular-nums">
          {value}
        </span>
        <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {unit}
        </span>
      </div>
      <dl className="border-border/80 bg-muted/25 divide-border/80 flex flex-wrap divide-x border-y">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={cn(
              'relative flex min-w-0 flex-1 flex-col gap-1 px-4 py-3',
              cell.anomaly && 'text-foreground',
            )}
          >
            {cell.anomaly ? (
              <span
                aria-hidden="true"
                className="bg-destructive absolute inset-y-0 left-0 w-px"
              />
            ) : null}
            <dt className="text-muted-foreground text-[11px] font-medium tracking-widest uppercase">
              {cell.label}
            </dt>
            <dd className="text-sm font-medium break-words tabular-nums">
              {cellValue(cell.value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

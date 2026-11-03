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
        <span className="text-3xl leading-none font-light tracking-tighter tabular-nums">
          {value}
        </span>
        <span className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
          {unit}
        </span>
      </div>
      {/* Two columns on phones (cells wrap into a grid with hairlines on
          both axes), one row from sm up. */}
      <dl className="border-border bg-muted/25 grid grid-cols-2 border-y sm:flex">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={cn(
              'border-border relative flex min-w-0 flex-1 flex-col gap-1 px-3 py-3 sm:px-4',
              'sm:[&:not(:first-child)]:border-l max-sm:[&:nth-child(even)]:border-l max-sm:[&:nth-child(n+3)]:border-t',
              // an odd last cell spans the row on phones
              'max-sm:last:odd:col-span-2',
              // the anomaly marker is the cell's own left edge, so it never
              // sits beside a grey divider and blurs into it
              cell.anomaly && 'border-l-destructive text-foreground border-l',
            )}
          >
            <dt className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
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

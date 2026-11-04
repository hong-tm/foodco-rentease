import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type SpecCell = {
  label: string
  value: ReactNode
  /** Something is wrong here: a red mark on the value. */
  anomaly?: boolean
  /** Something waits on the reader: a brand mark on the value. */
  attention?: boolean
}

type SpecStripProps = {
  value: string
  unit: string
  cells: SpecCell[]
  /** Controls for this view, on the headline's right edge. */
  actions?: ReactNode
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

export function SpecStrip({ value, unit, cells, actions }: SpecStripProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
        <p className="flex min-w-0 items-baseline gap-2.5">
          <span className="type-stat">{value}</span>
          <span className="text-muted-foreground text-sm">{unit}</span>
        </p>
        {actions ? (
          <div className="flex flex-wrap gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
            {actions}
          </div>
        ) : null}
      </div>
      {/* One container split by hairlines. On phones each cell is a
          label-and-value row, so nothing squeezes into half a column. */}
      <dl className="bg-card divide-border flex flex-col divide-y rounded-xl border sm:flex-row sm:divide-x sm:divide-y-0">
        {cells.map((cell) => (
          <div
            key={cell.label}
            className="flex min-w-0 flex-1 items-baseline justify-between gap-4 px-4 py-3 sm:flex-col sm:justify-start sm:gap-1 sm:px-5 sm:py-4"
          >
            <dt className="type-label text-muted-foreground">{cell.label}</dt>
            <dd className="type-section-title flex items-baseline gap-2 tabular-nums max-sm:text-right">
              {cell.anomaly || cell.attention ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-2 shrink-0 self-center rounded-full',
                    cell.anomaly ? 'bg-destructive' : 'bg-primary',
                  )}
                />
              ) : null}
              <span className="min-w-0 break-words">
                {cellValue(cell.value)}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// Lists lead with their rows: the count and its parts are one quiet line above
// the table. The large statistic belongs to screens whose number is the answer.
export function SummaryLine({ value, unit, cells, actions }: SpecStripProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <dl className="flex min-w-0 flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
        <div className="flex items-baseline gap-1.5">
          <dt className="sr-only">Total</dt>
          <dd className="type-section-title tabular-nums">
            {value} <span className="font-normal">{unit}</span>
          </dd>
        </div>
        {cells.map((cell) => (
          <div key={cell.label} className="flex items-baseline gap-1.5">
            <dt className="text-muted-foreground">{cell.label}</dt>
            <dd className="flex items-baseline gap-1.5 font-medium tabular-nums">
              {cell.anomaly || cell.attention ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    'size-2 shrink-0 self-center rounded-full',
                    cell.anomaly ? 'bg-destructive' : 'bg-primary',
                  )}
                />
              ) : null}
              {cell.value}
            </dd>
          </div>
        ))}
      </dl>
      {actions ? (
        <div className="flex flex-wrap gap-2 max-sm:w-full max-sm:[&>*]:flex-1">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

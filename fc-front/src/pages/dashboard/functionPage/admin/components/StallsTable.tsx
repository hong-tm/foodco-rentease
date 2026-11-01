import { useState } from 'react'
import type { GetStallsResponse } from '@/api/stallApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'

import { StallButton } from './StallButton'
import { StallsTableSkeleton } from './StallTableSkeleton'

export const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

// The board reproduces the recorded floor plan: seven stalls along the front,
// three back-to-back pairs across the centre aisle, seven along the rear. These
// are proportions of one map, so they stay page-scoped instead of becoming
// global tokens. A stall set of any other size falls back to a plain grid.
const FRONT_ROW = 7
const AISLE_PAIRS = 3
const FLOOR_PLAN_SIZE = FRONT_ROW * 2 + AISLE_PAIRS * 2

export type StallState = 'rented' | 'vacant' | 'ended'

export function stallState(stall: StallUserAttributes): StallState {
  if (!stall.rentStatus) return 'vacant'
  if (stall.endAt && new Date(stall.endAt).getTime() < Date.now()) return 'ended'
  return 'rented'
}

function Legend() {
  return (
    <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="bg-foreground size-2 rounded-full" />
        Rented
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="border-muted-foreground/60 size-2 rounded-full border"
        />
        Vacant
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="bg-destructive dark:bg-destructive-foreground size-2 rounded-full"
        />
        Lease ended
      </li>
    </ul>
  )
}

export default function StallsTable() {
  const [openStallId, setOpenStallId] = useState<string | null>(null)
  const { data, isLoading, error, refetch } = useQuery<GetStallsResponse>(
    fetchStallsQueryOptions,
  )

  if (isLoading) {
    return <StallsTableSkeleton />
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
      >
        <p>Stalls could not be loaded: {(error as Error).message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const stalls = [...(data?.stall ?? [])].sort(
    (a, b) => a.stallNumber - b.stallNumber,
  )

  if (stalls.length === 0) {
    return <p className="text-muted-foreground text-sm">No stalls recorded.</p>
  }

  const vacant = stalls.filter((stall) => stallState(stall) === 'vacant')
  const ended = stalls.filter((stall) => stallState(stall) === 'ended')
  const rented = stalls.length - vacant.length - ended.length
  const isFloorPlan = stalls.length === FLOOR_PLAN_SIZE

  const tile = (stall: StallUserAttributes) => (
    <StallButton
      key={`stall-${stall.stallNumber}`}
      stall={stall}
      state={stallState(stall)}
      onOpen={setOpenStallId}
      isOpen={openStallId === `stall-${stall.stallNumber}`}
    />
  )

  const rowClass = isFloorPlan
    ? 'grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7'
    : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'

  const front = stalls.slice(0, FRONT_ROW)
  const pairs = Array.from({ length: AISLE_PAIRS }, (_, index) =>
    stalls.slice(FRONT_ROW + index * 2, FRONT_ROW + index * 2 + 2),
  )
  const back = stalls.slice(FLOOR_PLAN_SIZE - FRONT_ROW)

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Occupancy summary" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {vacant.length}
          </span>
          <span className={labelClass}>
            {vacant.length === 1 ? 'stall vacant' : 'stalls vacant'}
          </span>
        </div>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className={labelClass}>Occupancy</span>
          <span className="tabular-nums">
            {rented} of {stalls.length} rented
          </span>
          {ended.length > 0 && (
            <span className="text-muted-foreground tabular-nums">
              {ended.length} {ended.length === 1 ? 'lease' : 'leases'} ran out
              without a renewal date
            </span>
          )}
        </p>
      </section>

      <section aria-label="Stall board" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-medium">Stalls</h2>
          <Legend />
        </div>

        <TooltipProvider>
          <div className="border-border rounded-xl border p-4 sm:p-6">
            {isFloorPlan ? (
              <div className="flex flex-col gap-4">
                <div className={rowClass}>{front.map(tile)}</div>
                {pairs.map((pair, index) => (
                  <div
                    key={`pair-${index}`}
                    className="grid grid-cols-2 items-center gap-3 lg:grid-cols-7"
                  >
                    {pair[0] ? tile(pair[0]) : <span />}
                    <span
                      aria-hidden="true"
                      className="border-border/70 col-span-5 border-t border-dashed max-lg:hidden"
                    />
                    {pair[1] ? tile(pair[1]) : <span />}
                  </div>
                ))}
                <div className={rowClass}>{back.map(tile)}</div>
              </div>
            ) : (
              <div className={rowClass}>{stalls.map(tile)}</div>
            )}
          </div>
        </TooltipProvider>
      </section>
    </div>
  )
}

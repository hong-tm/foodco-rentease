import { Fragment, useState } from 'react'
import type { GetStallsResponse } from '@/api/stallApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'

import { AISLE_PAIRS, FLOOR_PLAN_SIZE, FRONT_ROW, stallState } from '@/lib/floorPlan'

import { Button } from '@/components/ui/button'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SpecStrip } from '@/components/dashboard/SpecStrip'

import { StallButton } from './StallButton'
import { StallsTableSkeleton } from './StallTableSkeleton'

function Legend() {
  return (
    <ul className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="bg-card border-border size-3 rounded-sm border"
        />
        Rented
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="bg-brand-soft border-primary size-3 rounded-sm border"
        />
        Vacant
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="bg-destructive-soft border-destructive size-3 rounded-sm border"
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
    ? 'contents lg:grid lg:grid-cols-7 lg:gap-3'
    : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'

  const front = stalls.slice(0, FRONT_ROW)
  const pairs = Array.from({ length: AISLE_PAIRS }, (_, index) =>
    stalls.slice(FRONT_ROW + index * 2, FRONT_ROW + index * 2 + 2),
  )
  const back = stalls.slice(FLOOR_PLAN_SIZE - FRONT_ROW)

  return (
    <div className="flex flex-col gap-6">
      <SpecStrip
        value={String(vacant.length)}
        unit={vacant.length === 1 ? 'stall vacant' : 'stalls vacant'}
        cells={[
          {
            label: 'Rented',
            value: `${rented}/${stalls.length}`,
          },
          {
            label: 'Lease ended',
            value: ended.length,
            anomaly: ended.length > 0,
          },
        ]}
      />

      <section aria-label="Stall board" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-medium">Stalls</h2>
          <Legend />
        </div>

        <TooltipProvider>
          <div className="border-border rounded-xl border p-4 sm:p-6">
            {isFloorPlan ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:flex lg:flex-col lg:gap-4">
                <div className={rowClass}>{front.map(tile)}</div>
                {/* One aisle running the height of the three pairs. */}
                <div className="contents lg:grid lg:grid-cols-7 lg:gap-3">
                  <div className="bg-muted/50 text-muted-foreground flex items-center justify-center rounded-lg text-sm max-lg:hidden lg:col-span-5 lg:col-start-2 lg:row-span-3 lg:row-start-1">
                    Central aisle
                  </div>
                  {pairs.map((pair, index) => (
                    <Fragment key={`pair-${index}`}>
                      <div className="lg:col-start-1">
                        {pair[0] ? tile(pair[0]) : null}
                      </div>
                      <div className="lg:col-start-7">
                        {pair[1] ? tile(pair[1]) : null}
                      </div>
                    </Fragment>
                  ))}
                </div>
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

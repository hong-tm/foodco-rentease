import { useState } from 'react'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { StallDialog } from '@/pages/dashboard/components/StallDialog'
import {
  StallFloorPlan,
  StateSwatch,
} from '@/pages/dashboard/components/StallFloorPlan'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { boardState, boardStateLabel, type BoardState } from '@/lib/stall-lease'

import { Badge } from '@/components/ui/badge'
import { Panel, PanelError, PanelHeader } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

const legend: { state: BoardState; to: string }[] = [
  { state: 'followup', to: '/dashboard/tenant-information?view=attention' },
  { state: 'free', to: '/dashboard/stall-availability' },
  { state: 'let', to: '/dashboard/stall-availability?state=let' },
]

function occupancyStatus(rate: number) {
  if (rate >= 80)
    return {
      label: 'High Demand',
      variant: 'positive' as const,
    }
  if (rate <= 40)
    return {
      label: 'Low Occupancy',
      variant: 'negative' as const,
    }
  return {
    label: 'Moderate',
    variant: 'warning' as const,
  }
}

export function VacancyChart({ className }: { className?: string }) {
  const { data, isLoading, error, refetch } = useQuery(fetchStallsQueryOptions)
  const [open, setOpen] = useState<StallUserAttributes | null>(null)
  const month = new Date().toLocaleString('en-US', { month: 'long' })

  if (isLoading) {
    return (
      <Panel className={className}>
        <PanelHeader title="Occupancy" meta={`${month} overview`} />
        <Skeleton className="h-60 flex-1" />
      </Panel>
    )
  }

  if (error || !data) {
    return (
      <Panel className={className}>
        <PanelHeader title="Occupancy" meta={`${month} overview`} />
        <PanelError what="occupancy" onRetry={() => refetch()} />
      </Panel>
    )
  }

  const stalls = data.stall
  const total = stalls.length
  const rented = stalls.filter((stall) => stall.rentStatus).length
  const rate = total > 0 ? (rented / total) * 100 : 0
  const status = occupancyStatus(rate)
  const counts: Record<BoardState, number> = { free: 0, followup: 0, let: 0 }
  stalls.forEach((stall) => {
    counts[boardState(stall)] += 1
  })

  return (
    <Panel className={className}>
      <PanelHeader title="Occupancy" meta={`${month} overview`} />
      <StallFloorPlan
        stalls={stalls}
        size="compact"
        onOpen={setOpen}
        matches={(stall) => boardState(stall) === 'followup'}
        className="min-h-60 flex-1"
        centre={
          <>
            <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
              <p className="type-figure-lead">{rate.toFixed(1)}%</p>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            <p className="type-body text-muted-foreground mt-1">
              {rented} of {total} let, {counts.followup} need follow-up
            </p>
          </>
        }
      />
      <ul className="grid grid-cols-1 gap-x-4 gap-y-1 md:flex md:flex-wrap md:gap-x-5">
        {legend.map((item) => (
          <li key={item.state}>
            <Link
              to={item.to}
              className="type-body hover:bg-accent focus-visible:ring-ring -mx-1 flex min-h-11 items-center gap-2 rounded-md px-1 outline-none focus-visible:ring-2 md:min-h-8"
            >
              <StateSwatch state={item.state} />
              <span className="text-muted-foreground">
                {boardStateLabel[item.state]}
              </span>
              <span className="font-medium max-md:ml-auto">
                {counts[item.state]}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <StallDialog stall={open} onClose={() => setOpen(null)} />
    </Panel>
  )
}

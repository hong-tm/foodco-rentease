import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { StallDialog } from '@/pages/dashboard/components/StallDialog'
import { StallFloorPlan } from '@/pages/dashboard/components/StallFloorPlan'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'
import { Link, useSearchParams } from 'react-router-dom'

import { formatDate, formatRM, formatSize } from '@/lib/format'
import {
  boardState,
  boardStateLabel,
  byEndDate,
  isUrgent,
  timeLeftLabel,
  type BoardState,
} from '@/lib/stall-lease'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
} from '@/components/ui/panel'
import { CountTabs } from '@/components/ui/panel-parts'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Filter = BoardState | 'all'
type Stall = StallUserAttributes

const filterLabels: { value: Filter; label: string }[] = [
  { value: 'free', label: boardStateLabel.free },
  { value: 'followup', label: boardStateLabel.followup },
  { value: 'let', label: boardStateLabel.let },
  { value: 'all', label: 'All stalls' },
]

function priceOf(stall: Stall) {
  const tierPrice = Number(stall.stallTierNumber?.tierPrice)
  const size = Number(stall.stallSize)
  return tierPrice && size ? tierPrice * size : null
}

function joinList(items: (string | number)[]) {
  if (items.length < 2) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

function StallPeek({ stall }: { stall: Stall }) {
  const price = priceOf(stall)
  return (
    <div className="flex w-64 flex-col gap-2 py-1 text-left">
      <div>
        <p className="type-section">
          <span className="type-id text-muted-foreground mr-2">
            {stall.stallNumber}
          </span>
          {stall.stallName}
        </p>
        <p className="type-meta text-muted-foreground line-clamp-2">
          {stall.description}
        </p>
      </div>
      <dl className="type-body grid grid-cols-[72px_minmax(0,1fr)] gap-x-3 gap-y-1">
        <dt className="text-muted-foreground">Size</dt>
        <dd>{formatSize(stall.stallSize)}</dd>
        <dt className="text-muted-foreground">Tier</dt>
        <dd>
          {stall.stallTierNumber?.tierName ?? '—'}
          {price ? ` · ${formatRM(price)}` : ''}
        </dd>
        <dt className="text-muted-foreground">Tenant</dt>
        <dd className="truncate">
          {stall.stallOwnerId?.name ?? 'Not rent yet'}
        </dd>
        <dt className="text-muted-foreground">Lease end</dt>
        <dd>{stall.endAt ? formatDate(stall.endAt) : '—'}</dd>
      </dl>
    </div>
  )
}

export function StallAvailabilityPage() {
  const { data, isLoading, error, refetch } = useQuery(fetchStallsQueryOptions)
  const { data: session } = useSession()
  const [params, setParams] = useSearchParams()
  const requested = params.get('state') as Filter | null
  const filter: Filter = filterLabels.some((f) => f.value === requested)
    ? (requested as Filter)
    : 'free'
  const setFilter = (next: Filter) =>
    setParams(next === 'free' ? {} : { state: next }, { replace: true })
  const [open, setOpen] = useState<Stall | null>(null)

  const stalls = data?.stall ?? []
  const counts: Record<BoardState, number> = { free: 0, followup: 0, let: 0 }
  stalls.forEach((stall) => {
    counts[boardState(stall)] += 1
  })
  const matches = (stall: Stall) =>
    filter === 'all' || boardState(stall) === filter
  const listed = stalls
    .filter(matches)
    .sort((a, b) =>
      filter === 'free' || filter === 'all'
        ? a.stallNumber - b.stallNumber
        : byEndDate(a, b),
    )
  const freeNumbers = stalls
    .filter((stall) => !stall.rentStatus)
    .map((stall) => stall.stallNumber)
    .sort((a, b) => a - b)
  const isAdmin = session?.user.role === 'admin'

  const tiers = new Map<
    string,
    { price: number | null; free: number; let: number }
  >()
  stalls.forEach((stall) => {
    const name = stall.stallTierNumber?.tierName ?? 'No tier set'
    const entry = tiers.get(name) ?? {
      price: stall.stallTierNumber
        ? Number(stall.stallTierNumber.tierPrice)
        : null,
      free: 0,
      let: 0,
    }
    entry[stall.rentStatus ? 'let' : 'free'] += 1
    tiers.set(name, entry)
  })

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Stall availability"
        actions={
          isAdmin ? (
            <Button variant="outline" asChild className="max-md:h-11">
              <Link to="/dashboard/admin-appointment">Stall appointments</Link>
            </Button>
          ) : null
        }
      >
        {data
          ? freeNumbers.length
            ? `${freeNumbers.length} of ${stalls.length} stalls are free: ${joinList(freeNumbers)}. ${counts.followup} lease${counts.followup === 1 ? ' needs' : 's need'} follow-up.`
            : `All ${stalls.length} stalls are let.`
          : 'Loading the food court.'}
      </PageHeader>

      {error ? (
        <Panel>
          <PanelError what="stalls" onRetry={() => refetch()} />
        </Panel>
      ) : null}

      {!error ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel>
            <CountTabs
              label="Filter stalls"
              value={filter}
              onChange={setFilter}
              tabs={filterLabels.map((item) => ({
                value: item.value,
                label: item.label,
                count:
                  item.value === 'all' ? stalls.length : counts[item.value],
              }))}
            />
            {isLoading ? (
              <Skeleton className="h-[230px] md:h-[524px]" />
            ) : (
              <StallFloorPlan
                stalls={stalls}
                size="full"
                matches={filter === 'all' ? undefined : matches}
                active={open?.stallNumber}
                onOpen={setOpen}
                peek={(stall) => <StallPeek stall={stall} />}
                className="md:grid-rows-[repeat(5,100px)]"
                centre={
                  <>
                    <p className="type-figure-lead">{listed.length}</p>
                    <p className="type-body text-muted-foreground">
                      {filter === 'all'
                        ? 'stalls in the food court'
                        : `of ${stalls.length} stalls: ${boardStateLabel[filter].toLowerCase()}`}
                    </p>
                    <p className="type-meta text-muted-foreground mt-2 hidden md:block">
                      Select a stall to {isAdmin ? 'edit' : 'apply'}.
                    </p>
                  </>
                }
              />
            )}
          </Panel>
          <div className="flex min-w-0 flex-col gap-4 xl:h-0 xl:min-h-full">
            <Panel className="min-h-0 flex-1">
              <PanelHeader
                title={filterLabels.find((f) => f.value === filter)?.label}
                meta={`${listed.length} stall${listed.length === 1 ? '' : 's'}`}
              />
              {isLoading ? <Skeleton className="h-48" /> : null}
              {data && listed.length === 0 ? (
                <PanelEmpty>No stalls in this state.</PanelEmpty>
              ) : null}
              {listed.length > 0 ? (
                <ul className="-mx-2 flex min-h-0 flex-1 flex-col divide-y overflow-y-auto [scrollbar-width:thin]">
                  {listed.map((stall) => {
                    const price = priceOf(stall)
                    return (
                      <li key={stall.stallNumber}>
                        <button
                          type="button"
                          onClick={() => setOpen(stall)}
                          className="hover:bg-accent focus-visible:ring-ring flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-left outline-none focus-visible:ring-2"
                        >
                          <span className="type-id text-muted-foreground w-6 shrink-0">
                            {stall.stallNumber}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="type-body block truncate font-medium">
                              {stall.stallName}
                            </span>
                            <span className="type-meta text-muted-foreground block truncate">
                              {stall.rentStatus
                                ? stall.stallOwnerId?.name
                                : [
                                    Number(stall.stallSize)
                                      ? formatSize(stall.stallSize)
                                      : null,
                                    stall.stallTierNumber?.tierName,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ') || 'Size and tier not set'}
                            </span>
                          </span>
                          <span
                            className={cn(
                              'type-meta shrink-0 text-right',
                              stall.rentStatus && isUrgent(stall.endAt)
                                ? 'text-negative-ink font-medium'
                                : 'text-muted-foreground',
                            )}
                          >
                            {stall.rentStatus
                              ? timeLeftLabel(stall.endAt)
                              : price
                                ? formatRM(price)
                                : '—'}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              ) : null}
            </Panel>

            <Panel className="shrink-0 gap-1">
              <PanelHeader title="By tier" />
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-0">Tier</TableHead>
                    <TableHead className="text-right">Rate per m²</TableHead>
                    <TableHead className="text-right">Free</TableHead>
                    <TableHead className="pr-0 text-right">Let</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...tiers.entries()]
                    .sort((a, b) => (a[1].price ?? 1e9) - (b[1].price ?? 1e9))
                    .map(([name, tier]) => (
                      <TableRow key={name}>
                        <TableCell className="pl-0 font-medium">
                          {name}
                        </TableCell>
                        <TableCell className="text-right">
                          {tier.price ? formatRM(tier.price) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {tier.free}
                        </TableCell>
                        <TableCell className="pr-0 text-right">
                          {tier.let}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </Panel>
          </div>
        </div>
      ) : null}
      <StallDialog stall={open} onClose={() => setOpen(null)} />
    </div>
  )
}


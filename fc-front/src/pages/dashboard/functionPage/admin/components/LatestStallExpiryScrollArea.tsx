import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import {
  byEndDate,
  isUrgent,
  leaseState,
  timeLeftLabel,
} from '@/lib/stall-lease'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'

import { TenantActionButton } from './TenantActionButton'

export default function LatestStallExpiryScrollArea({
  className,
}: {
  className?: string
}) {
  const { data, isLoading, error, refetch } = useQuery(fetchStallsQueryOptions)

  const attention = (data?.stall ?? [])
    .filter((stall) => ['past', 'ending'].includes(leaseState(stall)))
    .sort(byEndDate)
  const upcoming = (data?.stall ?? [])
    .filter((stall) => leaseState(stall) === 'let' && stall.endAt)
    .sort(byEndDate)
  const rows = [...attention, ...upcoming].slice(0, 5)

  return (
    <Panel className={className}>
      <PanelHeader
        title="Leases to act on"
        meta={`${attention.length} past end date or ending within 30 days`}
        action={
          <Button variant="quiet" asChild>
            <Link to="/dashboard/tenant-information?view=attention">
              View all
            </Link>
          </Button>
        }
      />
      {isLoading ? <PanelRowsSkeleton rows={5} /> : null}
      {error ? <PanelError what="leases" onRetry={() => refetch()} /> : null}
      {data && rows.length === 0 ? (
        <PanelEmpty>No lease has an end date yet.</PanelEmpty>
      ) : null}
      {rows.length > 0 ? (
        <ul className="-mx-1 flex flex-1 flex-col divide-y px-1">
          {rows.map((stall) => (
            <li
              key={stall.stallNumber}
              className="flex min-h-14 items-center gap-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="type-body flex min-w-0 items-baseline gap-2">
                  <span className="type-id text-muted-foreground">
                    {stall.stallNumber}
                  </span>
                  <span className="truncate font-medium">
                    {stall.stallName}
                  </span>
                </p>
                <p className="type-meta text-muted-foreground truncate">
                  {stall.stallOwnerId?.name} ·{' '}
                  <span
                    className={cn(
                      isUrgent(stall.endAt) && 'text-negative-ink font-medium',
                    )}
                  >
                    {timeLeftLabel(stall.endAt)}
                  </span>
                </p>
              </div>
              {stall.stallOwnerId ? (
                <TenantActionButton
                  userName={stall.stallOwnerId.name}
                  userEmail={stall.stallOwnerId.email}
                  userStallId={stall.stallNumber}
                  userStallName={stall.stallName}
                  stallEndAt={stall.endAt}
                />
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  )
}

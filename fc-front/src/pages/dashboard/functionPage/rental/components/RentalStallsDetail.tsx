import type { GetStallCurrentResponse } from '@/api/stallApi'
import { Link } from '@tanstack/react-router'

import { formatDate, formatRM, formatSize } from '@/lib/format'
import {
  ENDING_SOON_DAYS,
  daysLeft,
  isUrgent,
  stallLabel,
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

type LeasedStall = GetStallCurrentResponse['stalls'][number]

const rentalFee = (stall: LeasedStall) =>
  Number(stall.stallTierNumber?.tierPrice ?? 0) * Number(stall.stallSize ?? 0)

function LeaseRow({ stall }: { stall: LeasedStall }) {
  const start = new Date(stall.startAt).getTime()
  const end = new Date(stall.endAt).getTime()
  const elapsed =
    end > start
      ? Math.min(1, Math.max(0, (Date.now() - start) / (end - start)))
      : 1
  const days = daysLeft(stall.endAt)
  const tone =
    days !== null && (days < 0 || isUrgent(stall.endAt))
      ? 'negative'
      : days !== null && days <= ENDING_SOON_DAYS
        ? 'warning'
        : 'neutral'

  return (
    <li className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-4 py-3.5 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1.4fr)_8rem] md:px-5">
      <span className="bg-muted type-section col-start-1 row-start-1 grid size-11 place-items-center overflow-hidden rounded-lg border tabular-nums">
        {stall.stallImage ? (
          <img
            src={stall.stallImage}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          stall.stallNumber
        )}
      </span>
      <div className="col-start-2 row-start-1 min-w-0">
        <p className="type-body truncate font-medium">{stallLabel(stall)}</p>
        <p className="type-meta text-muted-foreground truncate">
          Stall {stall.stallNumber} · {formatSize(stall.stallSize)}
          {stall.stallTierNumber?.tierName
            ? ` · ${stall.stallTierNumber.tierName}`
            : ''}
        </p>
      </div>
      <div className="col-span-full row-start-2 flex min-w-0 flex-col gap-1.5 md:col-span-1 md:col-start-3 md:row-start-1">
        <div
          role="meter"
          aria-label={`Lease on stall ${stall.stallNumber}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(elapsed * 100)}
          aria-valuetext={timeLeftLabel(stall.endAt)}
          className="bg-muted h-1.5 overflow-hidden rounded-full"
        >
          <div
            className={cn(
              'h-full rounded-full',
              tone === 'negative' ? 'bg-negative-ink' : 'bg-primary',
            )}
            style={{ width: `${elapsed * 100}%` }}
          />
        </div>
        <p className="type-meta text-muted-foreground flex justify-between gap-3">
          <span>{formatDate(stall.startAt)}</span>
          <span
            className={cn(
              tone === 'negative' && 'text-negative-ink font-medium',
              tone === 'warning' && 'text-warning-ink font-medium',
            )}
          >
            {timeLeftLabel(stall.endAt)} · {formatDate(stall.endAt)}
          </span>
        </p>
      </div>
      <div className="col-start-3 row-start-1 text-right md:col-start-4">
        <p className="type-body font-medium tabular-nums">
          {formatRM(rentalFee(stall))}
        </p>
        <p className="type-meta text-muted-foreground">rental fee</p>
      </div>
    </li>
  )
}

export default function RentalStallsDetail({
  stalls,
  isLoading,
  error,
  onRetry,
}: {
  stalls: LeasedStall[]
  isLoading: boolean
  error: boolean
  onRetry: () => void
}) {
  const total = stalls.reduce((sum, stall) => sum + rentalFee(stall), 0)

  return (
    <Panel className="gap-0 pb-0 md:pb-0">
      <PanelHeader
        className="pb-3"
        title="Leases"
        meta={
          stalls.length > 0
            ? `${stalls.length} stall${stalls.length === 1 ? '' : 's'} · ${formatRM(total)} in rental fees · ends soonest first`
            : undefined
        }
      />
      {isLoading ? (
        <div className="pb-4 md:pb-5">
          <PanelRowsSkeleton rows={3} />
        </div>
      ) : error ? (
        <div className="pb-4 md:pb-5">
          <PanelError what="your stalls" onRetry={onRetry} />
        </div>
      ) : stalls.length === 0 ? (
        <div className="pb-4 md:pb-5">
          <PanelEmpty>
            You hold no stalls.{' '}
            <Button variant="quiet" asChild>
              <Link to="/dashboard/stall-availability">See free stalls</Link>
            </Button>
          </PanelEmpty>
        </div>
      ) : (
        <ul className="-mx-4 divide-y border-t md:-mx-5">
          {stalls.map((stall) => (
            <LeaseRow key={stall.stallNumber} stall={stall} />
          ))}
        </ul>
      )}
    </Panel>
  )
}

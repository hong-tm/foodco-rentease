import { fetchRentalsQueryOptions } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { TenantActionButton } from './TenantActionButton'

const DAY_MS = 24 * 60 * 60 * 1000
const REMINDER_WINDOW_DAYS = 7

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

const urgentBadgeClass = 'font-medium tabular-nums'

function daysLeft(endAt?: Date | string | null) {
  if (!endAt) return null
  return Math.ceil((new Date(endAt).getTime() - Date.now()) / DAY_MS)
}

function expiryBadge(endAt?: Date | string | null) {
  const left = daysLeft(endAt)
  if (left === null) return 'No end date'
  if (left < 0) return 'Lease ended'
  if (left === 0) return 'Ends today'
  if (left === 1) return '1 day left'
  return `${left} days left`
}

function leasePeriod(
  startAt?: Date | string | null,
  endAt?: Date | string | null,
) {
  const start = formatDay(startAt) ?? 'no start date'
  const end = formatDay(endAt) ?? 'no end date'
  return `${start} – ${end}`
}

export default function RentalsTable() {
  const { data, error, isLoading, refetch } = useQuery(fetchRentalsQueryOptions)

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-border flex flex-col gap-5 rounded-xl border p-6"
      >
        <span className="sr-only">Loading tenants…</span>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3" aria-hidden="true">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
      >
        <p>Tenants could not be loaded: {error.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const users = data?.user ?? []
  const leases = users.flatMap((user) =>
    (user.stalls ?? []).map((stall) => ({ user, stall })),
  )

  if (leases.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No tenant leases recorded yet.
      </p>
    )
  }

  const endingSoon = leases
    .filter(({ stall }) => {
      const left = daysLeft(stall.endAt)
      return left !== null && left >= 0 && left <= REMINDER_WINDOW_DAYS
    })
    .sort(
      (a, b) =>
        new Date(a.stall.endAt as Date).getTime() -
        new Date(b.stall.endAt as Date).getTime(),
    )
  const alreadyEnded = leases.filter(({ stall }) => {
    const left = daysLeft(stall.endAt)
    return left !== null && left < 0
  })
  const soonest = endingSoon[0]

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Reminder summary" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {endingSoon.length}
          </span>
          <span className={labelClass}>
            {endingSoon.length === 1
              ? 'lease ending within 7 days'
              : 'leases ending within 7 days'}
          </span>
        </div>
        {soonest ? (
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
            <span className={labelClass}>Soonest</span>
            <span className="font-medium">{soonest.stall.stallName}</span>
            <span className="text-muted-foreground tabular-nums">
              Stall {soonest.stall.stallNumber} · Ends{' '}
              {formatDay(soonest.stall.endAt)}
            </span>
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Every lease runs longer than a week.
          </p>
        )}
        {alreadyEnded.length > 0 && (
          <p className="text-muted-foreground text-sm tabular-nums">
            {alreadyEnded.length}{' '}
            {alreadyEnded.length === 1 ? 'lease has' : 'leases have'} already
            ended without a renewal date.
          </p>
        )}
      </section>

      <div className="border-border max-w-full overflow-hidden rounded-xl border">
        <Table className="table-fixed">
          <TableCaption className="sr-only">
            Tenant leases with stall, lease period and reminder action
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={`h-12 w-[40%] pl-6 ${labelClass}`}>
                Tenant
              </TableHead>
              <TableHead
                className={`hidden h-12 w-[20%] xl:table-cell ${labelClass}`}
              >
                Stall
              </TableHead>
              <TableHead
                className={`hidden h-12 w-[22%] xl:table-cell ${labelClass}`}
              >
                Lease period
              </TableHead>
              <TableHead
                className={`hidden h-12 w-[18%] pr-6 text-right xl:table-cell ${labelClass}`}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leases.map(({ user, stall }) => {
              const left = daysLeft(stall.endAt)
              const needsAttention =
                left !== null && left <= REMINDER_WINDOW_DAYS
              const action =
                user.role === 'admin' ? null : (
                  <TenantActionButton
                    userName={user.name}
                    userEmail={user.email}
                    userStallId={stall.stallNumber}
                    userStallName={stall.stallName}
                    stallEndAt={stall.endAt}
                  />
                )
              return (
                <TableRow
                  key={`${user.id}-${stall.stallNumber}`}
                  className="border-border/60 hover:bg-muted/30"
                >
                  <TableCell className="py-5 pl-6 align-top whitespace-normal">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage rel="preload" src={user.image} alt="" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-6">
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="text-sm leading-none font-medium">
                            {user.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.email} · {user.phone ? user.phone : 'N/A'}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs xl:hidden">
                            {stall.stallName} · stall {stall.stallNumber} ·{' '}
                            {stall.stallSize} m²
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs xl:hidden">
                            <span className="text-muted-foreground tabular-nums">
                              {leasePeriod(stall.startAt, stall.endAt)}
                            </span>
                            {needsAttention && (
                              <Badge
                                variant="destructive"
                                className={urgentBadgeClass}
                              >
                                {expiryBadge(stall.endAt)}
                              </Badge>
                            )}
                          </p>
                        </div>
                        {action && (
                          <div className="mt-2 shrink-0 md:mt-0 xl:hidden">
                            {action}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-5 align-top whitespace-nowrap xl:table-cell">
                    <p className="text-sm leading-none font-medium">
                      {stall.stallName}
                    </p>
                    <p className="text-muted-foreground mt-1.5 text-xs tabular-nums">
                      Stall {stall.stallNumber} · {stall.stallSize} m²
                    </p>
                  </TableCell>
                  <TableCell className="hidden py-5 align-top whitespace-nowrap xl:table-cell">
                    <p className="text-sm leading-none tabular-nums">
                      {leasePeriod(stall.startAt, stall.endAt)}
                    </p>
                    {needsAttention && (
                      <Badge
                        variant="destructive"
                        className={`mt-2 ${urgentBadgeClass}`}
                      >
                        {expiryBadge(stall.endAt)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden py-5 pr-6 text-right align-top xl:table-cell">
                    {action}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

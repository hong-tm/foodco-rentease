import { fetchRentalsQueryOptions } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

function formatDay(value?: Date | string | null) {
  if (!value) return null
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function leasePeriod(
  startAt?: Date | string | null,
  endAt?: Date | string | null,
) {
  const start = formatDay(startAt) ?? 'No start date'
  const end = formatDay(endAt) ?? 'no end date'
  return `${start} – ${end}`
}

export default function RentalsTable() {
  const { data, error, isLoading, refetch } = useQuery(fetchRentalsQueryOptions)

  if (isLoading) {
    return (
      <p role="status" className="text-muted-foreground p-4 text-sm">
        Loading tenants…
      </p>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-lg border p-4 text-sm"
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
      return left !== null && left <= REMINDER_WINDOW_DAYS
    })
    .sort(
      (a, b) =>
        new Date(a.stall.endAt as Date).getTime() -
        new Date(b.stall.endAt as Date).getTime(),
    )
  const soonest = endingSoon[0]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="flex items-baseline gap-2">
          <span className="text-3xl leading-none font-semibold tabular-nums">
            {endingSoon.length}
          </span>
          <span className="text-sm font-medium">
            {endingSoon.length === 1
              ? 'lease ending within 7 days'
              : 'leases ending within 7 days'}
          </span>
        </p>
        {soonest ? (
          <p className="text-muted-foreground text-sm">
            Soonest: {soonest.stall.stallName} (stall{' '}
            {soonest.stall.stallNumber}), {formatDay(soonest.stall.endAt)}
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">
            Every lease runs longer than a week.
          </p>
        )}
      </div>

      <div className="border-border overflow-hidden rounded-lg border">
        <Table>
          <TableCaption className="sr-only">
            Tenant leases with stall, lease period and reminder action
          </TableCaption>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Tenant</TableHead>
              <TableHead className="hidden md:table-cell">Stall</TableHead>
              <TableHead className="hidden md:table-cell">
                Lease period
              </TableHead>
              <TableHead className="hidden pr-4 text-right md:table-cell">
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
                <TableRow key={`${user.id}-${stall.stallNumber}`}>
                  <TableCell className="py-3 whitespace-normal">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage rel="preload" src={user.image} alt="" />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {user.email} · {user.phone ? user.phone : 'N/A'}
                        </p>
                        <p className="text-muted-foreground mt-1 text-xs md:hidden">
                          {stall.stallName} · stall {stall.stallNumber} ·{' '}
                          {stall.stallSize} m²
                        </p>
                        <p className="mt-1 flex flex-wrap items-center gap-2 text-xs md:hidden">
                          <span className="text-muted-foreground">
                            {leasePeriod(stall.startAt, stall.endAt)}
                          </span>
                          {needsAttention && (
                            <Badge variant="destructive">
                              {expiryBadge(stall.endAt)}
                            </Badge>
                          )}
                        </p>
                        {action && (
                          <div className="mt-2 md:hidden">{action}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden py-3 md:table-cell">
                    <p className="font-medium">{stall.stallName}</p>
                    <p className="text-muted-foreground text-xs">
                      Stall {stall.stallNumber} · {stall.stallSize} m²
                    </p>
                  </TableCell>
                  <TableCell className="hidden py-3 whitespace-normal md:table-cell">
                    <p>{leasePeriod(stall.startAt, stall.endAt)}</p>
                    {needsAttention && (
                      <Badge variant="destructive" className="mt-1">
                        {expiryBadge(stall.endAt)}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="hidden py-3 pr-4 text-right md:table-cell">
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

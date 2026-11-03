import { fetchUsersQueryOptions } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

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
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import { SpecStrip } from '@/components/dashboard/SpecStrip'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

import { AdminActionButton } from './AdminActionButton'

// 30 / 18 / 18 / 16 / 18. The account cell carries three lines, so it keeps the
// largest share but no longer takes the slack; the four trailing columns stay
// near-even so role, status and joined date read as one band.
const COLUMN_WIDTH = {
  account: '30%',
  role: '18%',
  status: '18%',
  joined: '16%',
  action: '18%',
} as const

export default function UsersTable() {
  const { data, error, isLoading, refetch } = useQuery(fetchUsersQueryOptions)

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="border-border flex flex-col gap-5 rounded-xl border p-6"
      >
        <span className="sr-only">Loading accounts…</span>
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="flex items-center gap-3" aria-hidden="true">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-64" />
            </div>
            <Skeleton className="h-8 w-24" />
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
        <p>Accounts could not be loaded: {error.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  const users = data?.users ?? []

  if (users.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">No accounts recorded yet.</p>
    )
  }

  const banned = users.filter((user) => user.banned)
  const roleCount = (role: string) =>
    users.filter((user) => user.role === role).length

  return (
    <div className="flex flex-col gap-6">
      <SpecStrip
        value={String(users.length)}
        unit={users.length === 1 ? 'account' : 'accounts'}
        cells={[
          { label: 'Admins', value: roleCount('admin') },
          { label: 'Rental', value: roleCount('rental') },
          { label: 'Users', value: roleCount('user') },
          {
            label: 'Banned',
            value: banned.length,
            anomaly: banned.length > 0,
          },
        ]}
      />

      <div className="border-border max-w-full overflow-hidden rounded-xl border">
        <Table className="xl:min-w-table">
          <TableCaption className="sr-only">
            Accounts with role, status, join date and management actions
          </TableCaption>
          <TableHeader>
            <TableRow className="border-border bg-muted/35 border-b hover:bg-transparent">
              <TableHead
                className={`type-label text-muted-foreground h-12 pl-6`}
                style={{ width: COLUMN_WIDTH.account }}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden className="size-9" />
                  Account
                </span>
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.role }}
              >
                Role
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.status }}
              >
                Status
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.joined }}
              >
                Joined
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 pr-6 text-right xl:table-cell`}
                style={{ width: COLUMN_WIDTH.action }}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const action =
                user.role === 'admin' ? null : (
                  <AdminActionButton
                    userId={user.id}
                    userRole={user.role}
                    userBanned={user.banned}
                  />
                )
              return (
                <TableRow
                  key={user.id}
                  className="group/row border-border hover:bg-muted/20"
                >
                  <TableCell className="before:bg-foreground relative py-5 pl-6 align-baseline whitespace-normal before:absolute before:inset-y-0 before:left-0 before:w-px before:opacity-0 group-hover/row:before:opacity-100">
                    <div className="flex items-baseline gap-3">
                      <InitialsAvatar name={user.name} image={user.image} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-6">
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="text-sm leading-none font-medium">
                            {user.name}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user.email} · {user.phone ? user.phone : 'N/A'}
                          </p>
                          {!user.emailVerified && (
                            <p className="text-muted-foreground text-xs">
                              Unverified
                            </p>
                          )}
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs xl:hidden">
                            <span className="capitalize">{user.role}</span>
                            <span className="text-muted-foreground tabular-nums">
                              Joined {formatDay(user.createdAt)}
                            </span>
                            {user.banned && (
                              <StatusBadge label="Banned" tone="blocked" />
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
                  <TableCell
                    className="hidden py-5 align-baseline xl:table-cell"
                    style={{ width: COLUMN_WIDTH.role }}
                  >
                    <span className="text-sm capitalize">{user.role}</span>
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-baseline xl:table-cell"
                    style={{ width: COLUMN_WIDTH.status }}
                  >
                    <StatusBadge
                      label={user.banned ? 'Banned' : 'Active'}
                      tone={user.banned ? 'blocked' : 'settled'}
                    />
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-baseline xl:table-cell"
                    style={{ width: COLUMN_WIDTH.joined }}
                  >
                    <span className="text-sm tabular-nums">
                      {formatDay(user.createdAt)}
                    </span>
                  </TableCell>
                  <TableCell className="hidden py-5 pr-6 text-right align-baseline xl:table-cell">
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

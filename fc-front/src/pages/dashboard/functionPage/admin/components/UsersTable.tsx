import { fetchUsersQueryOptions } from '@/api/adminApi'
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

import { AdminActionButton } from './AdminActionButton'

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

// Same 40/16/16/16/12 split used by every list page in this sweep: the first
// column absorbs slack, the trailing columns hold their content width.
const COLUMN_WIDTH = {
  role: '16%',
  status: '16%',
  joined: '16%',
  action: '12%',
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
      <section aria-label="Account summary" className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {users.length}
          </span>
          <span className={labelClass}>
            {users.length === 1 ? 'account' : 'accounts'}
          </span>
        </div>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className={labelClass}>Breakdown</span>
          <span className="text-muted-foreground tabular-nums">
            {roleCount('admin')} admin · {roleCount('rental')} rental ·{' '}
            {roleCount('user')} user · {banned.length} banned
          </span>
        </p>
      </section>

      <div className="border-border max-w-full overflow-hidden rounded-xl border">
        <Table className="xl:min-w-table">
          <TableCaption className="sr-only">
            Accounts with role, status, join date and management actions
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={`h-12 w-2/5 pl-6 ${labelClass}`}>
                Account
              </TableHead>
              <TableHead
                className={`hidden h-12 xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.role }}
              >
                Role
              </TableHead>
              <TableHead
                className={`hidden h-12 xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.status }}
              >
                Status
              </TableHead>
              <TableHead
                className={`hidden h-12 xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.joined }}
              >
                Joined
              </TableHead>
              <TableHead
                className={`hidden h-12 pr-6 text-right xl:table-cell ${labelClass}`}
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
                  className="border-border/60 hover:bg-muted/30"
                >
                  <TableCell className="py-5 pl-6 align-top whitespace-normal">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage
                          rel="preload"
                          src={user.image ?? undefined}
                          alt=""
                        />
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
                              <Badge variant="destructive">Banned</Badge>
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
                    className="hidden py-5 align-top xl:table-cell"
                    style={{ width: COLUMN_WIDTH.role }}
                  >
                    <span className="text-sm capitalize">{user.role}</span>
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-top xl:table-cell"
                    style={{ width: COLUMN_WIDTH.status }}
                  >
                    {user.banned ? (
                      <Badge variant="destructive">Banned</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        Active
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-top xl:table-cell"
                    style={{ width: COLUMN_WIDTH.joined }}
                  >
                    <span className="text-sm tabular-nums">
                      {formatDay(user.createdAt)}
                    </span>
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

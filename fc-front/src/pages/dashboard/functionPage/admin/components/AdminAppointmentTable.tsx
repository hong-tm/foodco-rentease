import { fetchUsersQueryOptions, useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { useQuery } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'

import { formatDay } from '@/lib/format'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

import AdminAppointmentActionButton from './AdminAppointmentActionButton'

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

// First column absorbs slack; 26/12/12/10 keep the request text readable and the
// decision control at its own width.
const COLUMN_WIDTH = {
  request: '26%',
  requested: '12%',
  status: '12%',
  decision: '10%',
} as const

const MONTHS = [
  { value: 'all', label: 'All months' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
]

type AdminAppointmentTableProps = {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

function statusOf(read: boolean | null) {
  if (read === null) return 'Pending'
  return read ? 'Approved' : 'Rejected'
}

export default function AdminAppointmentTable({
  selectedMonth,
  onMonthChange,
}: AdminAppointmentTableProps) {
  const { data: session } = useSession()
  const { data: users } = useQuery(fetchUsersQueryOptions)
  const {
    data: notifications,
    error,
    isLoading,
    refetch,
  } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: ['get-notifications', session?.user?.id],
  })

  const monthLabel =
    MONTHS.find((month) => month.value === selectedMonth)?.label ?? 'All months'

  const today = startOfDay(new Date())
  const upcoming = (notifications ?? [])
    .filter((notification) => {
      const appointmentDate = startOfDay(new Date(notification.appointmentDate))
      const isCurrentOrFuture = appointmentDate >= today
      const isSelectedMonth =
        selectedMonth === 'all' ||
        appointmentDate.getMonth().toString() === selectedMonth
      return isCurrentOrFuture && isSelectedMonth
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )

  const pendingCount = upcoming.filter(
    (notification) => notification.notificationRead === null,
  ).length

  const toolbar = (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
            {pendingCount}
          </span>
          <span className={labelClass}>
            {pendingCount === 1 ? 'pending request' : 'pending requests'}
          </span>
        </div>
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <span className={labelClass}>Showing</span>
          <span className="text-muted-foreground tabular-nums">
            {monthLabel} · {upcoming.length} upcoming
          </span>
        </p>
      </div>
      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-44" aria-label="Filter by month">
          <SelectValue placeholder="Month" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{MONTHS[0].label}</SelectItem>
          {MONTHS.slice(1).map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <div
          role="status"
          aria-live="polite"
          className="border-border flex flex-col gap-5 rounded-xl border p-6"
        >
          <span className="sr-only">Loading appointments…</span>
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex items-center gap-3"
              aria-hidden="true"
            >
              <Skeleton className="size-9 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
      >
        <p>Appointments could not be loaded: {error.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <p className="text-muted-foreground text-sm">
          {selectedMonth === 'all'
            ? 'No upcoming appointments.'
            : `No upcoming appointments in ${monthLabel}.`}
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {toolbar}
      <div className="border-border max-w-full overflow-hidden rounded-xl border">
        <Table className="xl:min-w-table">
          <TableCaption className="sr-only">
            Upcoming appointment requests with decision status and action
          </TableCaption>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={`h-12 w-2/5 pl-6 ${labelClass}`}>
                Requester
              </TableHead>
              <TableHead
                className={`hidden h-12 xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.request }}
              >
                Request
              </TableHead>
              <TableHead
                className={`hidden h-12 xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.requested }}
              >
                Requested
              </TableHead>
              <TableHead
                className={`hidden h-12 xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.status }}
              >
                Status
              </TableHead>
              <TableHead
                className={`hidden h-12 pr-6 text-right xl:table-cell ${labelClass}`}
                style={{ width: COLUMN_WIDTH.decision }}
              >
                Decision
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {upcoming.map((notification) => {
              const user = users?.users.find(
                (candidate) => candidate.id === notification.userId,
              )
              const status = statusOf(notification.notificationRead)
              return (
                <TableRow
                  key={notification.notificationId}
                  className="border-border/60 hover:bg-muted/30"
                >
                  <TableCell className="py-5 pl-6 align-top whitespace-normal">
                    <div className="flex items-start gap-3">
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage
                          rel="preload"
                          src={user?.image ?? undefined}
                          alt=""
                        />
                        <AvatarFallback>
                          {user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-6">
                        <div className="flex min-w-0 flex-col gap-1">
                          <p className="text-sm leading-none font-medium">
                            {user?.name ?? 'Unknown account'}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {user?.email ?? 'No email on file'}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs xl:hidden">
                            {notification.notificationMessage}
                          </p>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-xs xl:hidden">
                            <span className="text-muted-foreground tabular-nums">
                              {formatDay(notification.appointmentDate)}
                            </span>
                            {status === 'Pending' ? (
                              <Badge>{status}</Badge>
                            ) : (
                              <span className="text-muted-foreground">
                                {status}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="mt-2 shrink-0 md:mt-0 xl:hidden">
                          <AdminAppointmentActionButton
                            appointmentId={notification.notificationId}
                            appointmentStatus={notification.notificationRead}
                            stallNumber={notification.stallNumber}
                          />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-top whitespace-normal xl:table-cell"
                    style={{ width: COLUMN_WIDTH.request }}
                  >
                    <span className="text-sm">
                      {notification.notificationMessage}
                    </span>
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-top xl:table-cell"
                    style={{ width: COLUMN_WIDTH.requested }}
                  >
                    <span className="text-sm tabular-nums">
                      {formatDay(notification.appointmentDate)}
                    </span>
                  </TableCell>
                  <TableCell
                    className="hidden py-5 align-top xl:table-cell"
                    style={{ width: COLUMN_WIDTH.status }}
                  >
                    {status === 'Pending' ? (
                      <Badge>{status}</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">
                        {status}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="hidden py-5 pr-6 text-right align-top xl:table-cell">
                    <AdminAppointmentActionButton
                      appointmentId={notification.notificationId}
                      appointmentStatus={notification.notificationRead}
                      stallNumber={notification.stallNumber}
                    />
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

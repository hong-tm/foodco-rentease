import { fetchUsersQueryOptions } from '@/api/adminApi'
import {
  getAllNotificationQueryOptions,
  notificationsQueryKey,
} from '@/api/notificationApi'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { startOfDay } from 'date-fns'

import { formatDate } from '@/lib/format'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'

export default function LatestAppointmentScrollArea({
  className,
}: {
  className?: string
}) {
  const { data: users } = useQuery(fetchUsersQueryOptions)
  const {
    data: notifications,
    isLoading,
    error,
    refetch,
  } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: notificationsQueryKey.notifications(),
  })

  const today = startOfDay(new Date())
  const rows = (notifications ?? [])
    .filter(
      (notification) =>
        startOfDay(new Date(notification.appointmentDate)) >= today &&
        notification.notificationMessage.includes(
          'I want to make appointment for',
        ) &&
        notification.notificationRead !== false,
    )
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
    .map((notification) => ({
      ...notification,
      stallId:
        notification.notificationMessage.match(/stall (\d+)/i)?.[1] ?? null,
      user: users?.users.find((user) => user.id === notification.userId),
    }))
  const waiting = rows.filter((row) => row.notificationRead === null).length

  return (
    <Panel className={className}>
      <PanelHeader
        title="Upcoming appointments"
        meta={`${waiting} pending`}
        action={
          <Button variant="quiet" asChild>
            <Link to="/dashboard/admin-appointment">View all</Link>
          </Button>
        }
      />
      {isLoading ? <PanelRowsSkeleton rows={4} /> : null}
      {error ? (
        <PanelError what="appointments" onRetry={() => refetch()} />
      ) : null}
      {notifications && rows.length === 0 ? (
        <PanelEmpty>No appointments are coming up.</PanelEmpty>
      ) : null}
      {rows.length > 0 ? (
        <ul className="flex flex-1 flex-col divide-y">
          {rows.map((row) => (
            <li
              key={row.notificationId ?? `${row.userId}-${row.appointmentDate}`}
              className="flex min-h-13 flex-1 items-center gap-3 py-1.5"
            >
              <time
                dateTime={new Date(row.appointmentDate).toISOString()}
                className="bg-muted flex size-11 shrink-0 flex-col items-center justify-center rounded-lg leading-none"
              >
                <span className="type-strong">
                  {new Date(row.appointmentDate).getDate()}
                </span>
                <span className="type-meta text-muted-foreground">
                  {new Date(row.appointmentDate).toLocaleString('en-MY', {
                    month: 'short',
                  })}
                </span>
              </time>
              <div className="min-w-0 flex-1">
                <p className="type-body truncate font-medium">
                  {row.user?.name ?? 'Unknown user'}
                </p>
                <p className="type-meta text-muted-foreground truncate">
                  {row.stallId ? (
                    <>
                      Stall <span className="type-id">{row.stallId}</span>
                    </>
                  ) : (
                    formatDate(row.appointmentDate)
                  )}
                </p>
              </div>
              <Badge
                variant={
                  row.notificationRead === null
                    ? 'warning'
                    : row.notificationRead
                      ? 'positive'
                      : 'negative'
                }
              >
                {row.notificationRead === null
                  ? 'Pending'
                  : row.notificationRead
                    ? 'Approved'
                    : 'Rejected'}
              </Badge>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  )
}

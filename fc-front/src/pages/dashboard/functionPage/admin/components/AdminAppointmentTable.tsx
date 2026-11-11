import { useState } from 'react'
import { fetchUsersQueryOptions, useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { useQuery } from '@tanstack/react-query'
import { format, startOfDay } from 'date-fns'

import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { PanelError, PanelRowsSkeleton } from '@/components/ui/panel'
import {
  CountTabs,
  PanelToolbar,
  TablePager,
  TablePanel,
  usePager,
} from '@/components/ui/panel-parts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PersonAvatar } from '@/components/person-avatar'

import AdminAppointmentActionButton from './AdminAppointmentActionButton'

type Status = 'all' | 'pending' | 'approved' | 'rejected'

const statusOf = (read: boolean | null): Exclude<Status, 'all'> =>
  read === null ? 'pending' : read ? 'approved' : 'rejected'

const monthKey = (date: string | Date) => format(new Date(date), 'yyyy-MM')

export default function AdminAppointmentTable() {
  const [status, setStatus] = useState<Status>('all')
  const [month, setMonth] = useState('all')
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

  // Past appointments have nothing left to act on, so this list leaves them out.
  const today = startOfDay(new Date())
  const current = (notifications ?? [])
    .filter((item) => startOfDay(new Date(item.appointmentDate)) >= today)
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
  const months = [
    ...new Set(current.map((item) => monthKey(item.appointmentDate))),
  ]
  const inMonth = current.filter(
    (item) => month === 'all' || monthKey(item.appointmentDate) === month,
  )
  const countOf = (value: Exclude<Status, 'all'>) =>
    inMonth.filter((item) => statusOf(item.notificationRead) === value).length
  const rows = inMonth.filter(
    (item) => status === 'all' || statusOf(item.notificationRead) === status,
  )
  const pager = usePager(rows, 15)

  return (
    <TablePanel>
      <PanelToolbar>
        <CountTabs
          label="Filter by status"
          value={status}
          onChange={setStatus}
          tabs={[
            { value: 'all', label: 'All', count: inMonth.length },
            { value: 'pending', label: 'Pending', count: countOf('pending') },
            {
              value: 'approved',
              label: 'Approved',
              count: countOf('approved'),
            },
            {
              value: 'rejected',
              label: 'Rejected',
              count: countOf('rejected'),
            },
          ]}
        />
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger
            aria-label="Filter by month"
            className="w-44 max-md:h-11 max-md:w-full md:ml-auto"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {months.map((key) => (
              <SelectItem key={key} value={key}>
                {format(new Date(`${key}-15`), 'MMMM yyyy')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PanelToolbar>
      {isLoading ? (
        <div className="p-4 md:p-5">
          <PanelRowsSkeleton rows={4} />
        </div>
      ) : null}
      {error ? (
        <div className="p-4 md:p-5">
          <PanelError what="appointments" onRetry={() => refetch()} />
        </div>
      ) : null}
      {notifications ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-md:hidden">Date</TableHead>
                <TableHead>Applicant</TableHead>
                <TableHead className="max-md:hidden">Request</TableHead>
                <TableHead className="max-md:hidden">Status</TableHead>
                <TableHead className="text-right">
                  <span className="sr-only">Action</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.rows.map((item) => {
                const user = users?.users.find((u) => u.id === item.userId)
                const value = statusOf(item.notificationRead)
                const statusBadge = (
                  <Badge
                    variant={
                      value === 'pending'
                        ? 'warning'
                        : value === 'approved'
                          ? 'positive'
                          : 'negative'
                    }
                  >
                    {value === 'pending'
                      ? 'Pending'
                      : value === 'approved'
                        ? 'Approved'
                        : 'Rejected'}
                  </Badge>
                )
                return (
                  <TableRow key={item.notificationId}>
                    <TableCell className="font-medium whitespace-nowrap max-md:hidden">
                      {formatDate(item.appointmentDate)}
                    </TableCell>
                    <TableCell className="max-md:w-full max-md:max-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <PersonAvatar
                          id={item.userId}
                          name={user?.name}
                          image={user?.image}
                          className="size-6"
                        />
                        <span className="truncate">
                          {user?.name ?? 'Unknown user'}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-col items-start gap-1 md:hidden">
                        <p className="type-meta text-muted-foreground">
                          {formatDate(item.appointmentDate)}
                        </p>
                        <p className="type-meta text-muted-foreground whitespace-normal">
                          {item.notificationMessage}
                        </p>
                        {statusBadge}
                        {value === 'pending' ? (
                          <div className="mt-1 flex gap-2 *:empty:hidden">
                            <AdminAppointmentActionButton
                              appointmentId={item.notificationId}
                              appointmentStatus={item.notificationRead}
                              stallNumber={item.stallNumber}
                            />
                          </div>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground min-w-56 whitespace-normal max-md:hidden">
                      {item.notificationMessage}
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      {statusBadge}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right',
                        value === 'pending' && 'max-md:hidden',
                      )}
                    >
                      <div className="flex items-center justify-end gap-2 *:empty:hidden">
                        <AdminAppointmentActionButton
                          appointmentId={item.notificationId}
                          appointmentStatus={item.notificationRead}
                          stallNumber={item.stallNumber}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {pager.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="type-body text-muted-foreground py-8 text-center"
                  >
                    No appointments match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePager pager={pager} noun="appointments" />
        </>
      ) : null}
    </TablePanel>
  )
}

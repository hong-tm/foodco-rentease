import { fetchUsersQueryOptions, useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { useQuery } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import AdminAppointmentActionButton from './AdminAppointmentActionButton'

type AdminAppointmentTableProps = {
  selectedMonth: string
}

export default function AdminAppointmentTable({
  selectedMonth,
}: AdminAppointmentTableProps) {
  const { data: session } = useSession()
  const { data: users } = useQuery(fetchUsersQueryOptions)
  const {
    data: notifications,
    error,
    isLoading,
  } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: ['get-notifications', session?.user?.id],
  })

  if (isLoading) {
    return <div className="justify-center p-4">Loading...</div>
  }

  if (error) {
    return <div className="justify-center p-4">Error: {error.message}</div>
  }

  if (!notifications || notifications.length === 0) {
    return <div className="justify-center p-4">No notifications found</div>
  }

  // Filter out expired appointments and by selected month
  const today = startOfDay(new Date())
  const currentNotifications = notifications.filter((notification) => {
    const appointmentDate = new Date(notification.appointmentDate)
    const isCurrentOrFuture = startOfDay(appointmentDate) >= today
    const isSelectedMonth =
      selectedMonth === 'all' ||
      appointmentDate.getMonth().toString() === selectedMonth
    return isCurrentOrFuture && isSelectedMonth
  })

  if (currentNotifications.length === 0) {
    return (
      <div className="justify-center p-4">
        No current appointments found{' '}
        {selectedMonth !== 'all' ? 'for the selected month' : ''}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead></TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentNotifications.map((notification) => {
              const user = users?.users.find(
                (u) => u.id === notification.userId,
              )
              return (
                <TableRow key={notification.notificationId}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        rel="preload"
                        src={user?.image || ''}
                        alt="User Avatar"
                      />
                      <AvatarFallback>{user?.name?.[0] || 'U'}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    {new Date(
                      notification.appointmentDate,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    {notification.notificationMessage}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge
                      variant={
                        notification.notificationRead === null
                          ? 'secondary'
                          : notification.notificationRead
                            ? 'default'
                            : 'destructive'
                      }
                    >
                      {notification.notificationRead === null
                        ? 'Pending'
                        : notification.notificationRead
                          ? 'Approved'
                          : 'Rejected'}
                    </Badge>
                  </TableCell>
                  <TableCell>
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

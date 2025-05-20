import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useQuery } from '@tanstack/react-query'
import { useSession } from '@/api/adminApi'
import { fetchUsersQueryOptions } from '@/api/adminApi'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { startOfDay } from 'date-fns'

export default function LatestAppointmentScrollArea() {
  const { data: session } = useSession()
  const { data: users } = useQuery(fetchUsersQueryOptions)
  const { data: notifications } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: ['get-notifications', session?.user?.id],
  })

  // Filter out expired appointments, unread notifications and sort by appointment date
  const today = startOfDay(new Date())
  const sortedNotifications = notifications
    ?.filter((notification) => {
      const appointmentDate = startOfDay(new Date(notification.appointmentDate))
      return (
        appointmentDate >= today &&
        notification.notificationMessage.includes(
          'I want to make appointment for',
        ) &&
        notification.notificationRead === true // Only show read notifications
      )
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
    .map((notification) => {
      // Extract stall ID from message
      const match = notification.notificationMessage.match(/stall (\d+)/i)
      const stallId = match ? match[1] : 'N/A'
      return {
        ...notification,
        stallId,
      }
    })

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Recent Appointments</CardTitle>
        <CardDescription>List of recent appointment requests</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Stall</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedNotifications?.map((notification) => {
                const user = users?.users.find(
                  (u) => u.id === notification.userId,
                )
                return (
                  <TableRow key={notification.notificationId}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage
                          src={user?.image || ''}
                          alt="User Avatar"
                        />
                        <AvatarFallback>
                          {user?.name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium">
                      Stall {notification.stallId}
                    </TableCell>
                    <TableCell>
                      {new Date(
                        notification.appointmentDate,
                      ).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

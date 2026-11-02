import { fetchUsersQueryOptions, useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { useQuery } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'

import { formatDay } from '@/lib/format'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'

export default function LatestAppointmentScrollArea() {
  const { data: session } = useSession()
  const { data: users } = useQuery(fetchUsersQueryOptions)
  const { data: notifications } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: ['get-notifications', session?.user?.id],
  })

  const today = startOfDay(new Date())
  const upcoming = notifications
    ?.filter((notification) => {
      const appointmentDate = startOfDay(new Date(notification.appointmentDate))
      return (
        appointmentDate >= today &&
        notification.notificationMessage.includes(
          'I want to make appointment for',
        ) &&
        notification.notificationRead === true
      )
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )
    .map((notification) => {
      const match = notification.notificationMessage.match(/stall (\d+)/i)
      return {
        ...notification,
        stallId: match ? match[1] : null,
      }
    })

  return (
    <Card className="flex h-full flex-col shadow-none">
      <CardHeader>
        <CardTitle>Recent appointments</CardTitle>
        <CardDescription>Confirmed appointments coming up</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          {upcoming?.length ? (
            <div className="divide-border/60 divide-y">
              {upcoming.map((notification) => {
                const user = users?.users.find(
                  (candidate) => candidate.id === notification.userId,
                )
                return (
                  <div
                    key={notification.notificationId}
                    className="flex items-center gap-3 py-3"
                  >
                    <InitialsAvatar
                      name={user?.name ?? 'Unknown'}
                      image={user?.image}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-sm leading-none font-medium">
                        {user?.name ?? 'Unknown account'}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {notification.stallId
                          ? `Stall ${notification.stallId}`
                          : 'Stall not recorded'}
                      </p>
                    </div>
                    <span className="text-muted-foreground text-xs tabular-nums">
                      {formatDay(notification.appointmentDate)}
                    </span>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground py-6 text-sm">
              No confirmed appointments coming up.
            </p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

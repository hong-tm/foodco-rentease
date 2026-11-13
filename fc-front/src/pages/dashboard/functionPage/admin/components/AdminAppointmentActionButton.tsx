import type { NotificationAttributes } from '@server/db/userModel'
import { updateAppointmentStatus } from '@/api/notificationApi'
import { useDeferredAction } from '@/hooks/use-deferred-action'
import {
  ChevronDownIcon,
  CircleCheckBigIcon,
  CircleOffIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppointmentData = {
  appointmentId: number
  appointmentStatus: boolean | null
  stallNumber: number
}

// AdminAppointmentTable queries notifications under
// ['get-notifications', <session user id>]; matching on the prefix keeps
// this button working without knowing the session.
const APPOINTMENTS_QUERY_KEY = ['get-notifications'] as const

export default function AdminAppointmentActionButton({
  appointmentId,
  appointmentStatus,
  stallNumber,
}: AppointmentData) {
  const deferred = useDeferredAction()

  const handleDecision = (notificationRead: boolean) =>
    deferred.patch<NotificationAttributes>({
      queryKey: APPOINTMENTS_QUERY_KEY,
      matches: (row) => row.notificationId === appointmentId,
      next: (row) => ({ ...row, notificationRead }),
      commit: () =>
        updateAppointmentStatus({
          notificationId: appointmentId,
          notificationRead,
          stallNumber,
        }),
      invalidateKey: APPOINTMENTS_QUERY_KEY,
      pendingTitle: notificationRead
        ? 'Appointment approved'
        : 'Appointment rejected',
      successTitle: notificationRead
        ? 'Appointment approved successfully'
        : 'Appointment rejected successfully',
      errorTitle: notificationRead
        ? 'Failed to approve appointment'
        : 'Failed to reject appointment',
    })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={appointmentStatus === null ? 'outline' : 'ghost'}
          size="sm"
          className={cn(
            'focus-visible:ring-foreground/80 focus-visible:ring-1 focus-visible:ring-offset-0',
            appointmentStatus !== null &&
              'text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:text-foreground transition-colors',
          )}
        >
          {appointmentStatus === null ? 'Decide' : 'Change'}
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appointment decision</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => handleDecision(true)}
          disabled={appointmentStatus === true}
          className="flex items-center"
        >
          <CircleCheckBigIcon className="mr-2 h-4 w-4" />
          Approve
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleDecision(false)}
          disabled={appointmentStatus === false}
          className="flex items-center"
        >
          <CircleOffIcon className="mr-2 h-4 w-4" />
          Reject
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

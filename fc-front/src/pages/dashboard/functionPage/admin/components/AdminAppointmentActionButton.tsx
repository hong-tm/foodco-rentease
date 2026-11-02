import { useState } from 'react'
import {
  notificationsQueryKey,
  updateAppointmentStatus,
} from '@/api/notificationApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ChevronDownIcon,
  CircleCheckBigIcon,
  CircleOffIcon,
} from 'lucide-react'
import { toast } from 'sonner'

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

export default function AdminAppointmentActionButton({
  appointmentId,
  appointmentStatus,
  stallNumber,
}: AppointmentData) {
  const [openApproveAppointment, setOpenApproveAppointment] = useState(false)
  const [openRejectAppointment, setOpenRejectAppointment] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: approveAppointment, isPending: isApproving } = useMutation({
    mutationFn: () =>
      updateAppointmentStatus({
        notificationId: appointmentId,
        notificationRead: true,
        stallNumber,
      }),
    onSuccess: () => {
      toast.success('Appointment approved successfully')
      setOpenApproveAppointment(false)
    },
    onError: (error) => {
      toast.error('Failed to approve appointment')
      console.error(error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey.all })
    },
  })

  const { mutate: rejectAppointment, isPending: isRejecting } = useMutation({
    mutationFn: () =>
      updateAppointmentStatus({
        notificationId: appointmentId,
        notificationRead: false,
        stallNumber,
      }),
    onSuccess: () => {
      toast.success('Appointment rejected successfully')
      setOpenRejectAppointment(false)
    },
    onError: (error) => {
      toast.error('Failed to reject appointment')
      console.error(error)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey.all })
    },
  })

  return (
    <DropdownMenu>
      <ResponsiveAlertDialog
        title="Approve this appointment?"
        description={`The tenant for stall ${stallNumber} can then attend the requested slot.`}
        confirmLabel="Approve"
        onClick={approveAppointment}
        open={openApproveAppointment}
        setOpen={setOpenApproveAppointment}
      />

      <ResponsiveAlertDialog
        title="Reject this appointment?"
        description={`The tenant for stall ${stallNumber} keeps their request but cannot attend the slot.`}
        confirmLabel="Reject"
        onClick={rejectAppointment}
        open={openRejectAppointment}
        setOpen={setOpenRejectAppointment}
      />
      <DropdownMenuTrigger asChild>
        <Button
          variant={appointmentStatus === null ? 'outline' : 'ghost'}
          size="sm"
          className={cn(
            'focus-visible:ring-foreground/80 focus-visible:ring-1 focus-visible:ring-offset-0',
            appointmentStatus !== null &&
              'text-muted-foreground opacity-60 transition-opacity group-hover/row:opacity-100 hover:text-foreground focus-visible:opacity-100',
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
          onClick={() => setOpenApproveAppointment(true)}
          disabled={appointmentStatus === true || isApproving}
          className="flex items-center"
        >
          <CircleCheckBigIcon className="mr-2 h-4 w-4" />
          {isApproving ? 'Approving…' : 'Approve'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setOpenRejectAppointment(true)}
          disabled={appointmentStatus === false || isRejecting}
          className="flex items-center"
        >
          <CircleOffIcon className="mr-2 h-4 w-4" />
          {isRejecting ? 'Rejecting…' : 'Reject'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

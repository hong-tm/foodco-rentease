import { useState } from 'react'
import { updateAppointmentStatus } from '@/api/notificationApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CircleCheckBigIcon,
  CircleOffIcon,
  EllipsisVerticalIcon,
} from 'lucide-react'
import { toast } from 'sonner'

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
      queryClient.invalidateQueries({ queryKey: ['get-notifications'] })
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
      queryClient.invalidateQueries({ queryKey: ['get-notifications'] })
    },
  })

  return (
    <DropdownMenu>
      <ResponsiveAlertDialog
        title="Are you sure you want to approve this appointment?"
        description="Approve this appointment will allow the user to make an appointment."
        onClick={approveAppointment}
        open={openApproveAppointment}
        setOpen={setOpenApproveAppointment}
      />

      <ResponsiveAlertDialog
        title="Are you sure you want to reject this appointment?"
        description="Reject this appointment will not allow the user to make an appointment."
        onClick={rejectAppointment}
        open={openRejectAppointment}
        setOpen={setOpenRejectAppointment}
      />
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <EllipsisVerticalIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appointment Action</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => setOpenApproveAppointment(true)}
          disabled={appointmentStatus === true || isApproving}
          className="flex items-center"
        >
          <CircleCheckBigIcon className="mr-2 h-4 w-4" />
          {isApproving ? 'Approving...' : 'Approve'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setOpenRejectAppointment(true)}
          disabled={appointmentStatus === false || isRejecting}
          className="flex items-center"
        >
          <CircleOffIcon className="mr-2 h-4 w-4" />
          {isRejecting ? 'Rejecting...' : 'Reject'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { Button } from '@/components/ui/button'
import { CircleCheckBig, CircleOff, EllipsisVertical } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useState } from 'react'
import { updateAppointmentStatus } from '@/api/notificationApi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export default function AdminAppointmentActionButton({
  appointmentId,
  appointmentStatus,
  stallNumber,
}: {
  appointmentId: number
  appointmentStatus: boolean | null
  stallNumber: number
}) {
  const [openApproveAppointment, setOpenApproveAppointment] = useState(false)
  const [openRejectAppointment, setOpenRejectAppointment] = useState(false)
  const queryClient = useQueryClient()

  const { mutate: approveAppointment, isPending: isApproving } = useMutation({
    mutationFn: () => updateAppointmentStatus(appointmentId, true, stallNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-notifications'] })
      toast.success('Appointment approved successfully')
      setOpenApproveAppointment(false)
    },
    onError: (error) => {
      toast.error('Failed to approve appointment')
      console.error(error)
    },
  })

  const { mutate: rejectAppointment, isPending: isRejecting } = useMutation({
    mutationFn: () =>
      updateAppointmentStatus(appointmentId, false, stallNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['get-notifications'] })
      toast.success('Appointment rejected successfully')
      setOpenRejectAppointment(false)
    },
    onError: (error) => {
      toast.error('Failed to reject appointment')
      console.error(error)
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
          <EllipsisVertical className="h-4 w-4" />
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
          <CircleCheckBig className="mr-2 h-4 w-4" />
          {isApproving ? 'Approving...' : 'Approve'}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setOpenRejectAppointment(true)}
          disabled={appointmentStatus === false || isRejecting}
          className="flex items-center"
        >
          <CircleOff className="mr-2 h-4 w-4" />
          {isRejecting ? 'Rejecting...' : 'Reject'}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

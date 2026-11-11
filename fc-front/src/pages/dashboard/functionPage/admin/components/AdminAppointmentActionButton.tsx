import { useState } from 'react'
import {
  notificationsQueryKey,
  updateAppointmentStatus,
} from '@/api/notificationApi'
import { notificationsCollection } from '@/db/collections'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { createTransaction } from '@tanstack/react-db'
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

  // Approve/reject run as TanStack DB transactions: the notification row
  // flips optimistically in the collection, the API call persists it, and
  // refetch settles the shared query cache the tables still read from.
  const { mutate: approveAppointment, isPending: isApproving } = useMutation({
    mutationFn: async () => {
      const tx = createTransaction({
        mutationFn: async () => {
          await updateAppointmentStatus({
            notificationId: appointmentId,
            notificationRead: true,
            stallNumber,
          })
          await notificationsCollection.utils.refetch()
        },
      })
      tx.mutate(() => {
        notificationsCollection.update(appointmentId, (draft) => {
          draft.notificationRead = true
        })
      })
      await tx.commit()
    },
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
    mutationFn: async () => {
      const tx = createTransaction({
        mutationFn: async () => {
          await updateAppointmentStatus({
            notificationId: appointmentId,
            notificationRead: false,
            stallNumber,
          })
          await notificationsCollection.utils.refetch()
        },
      })
      tx.mutate(() => {
        notificationsCollection.update(appointmentId, (draft) => {
          draft.notificationRead = false
        })
      })
      await tx.commit()
    },
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
    <>
      <ResponsiveAlertDialog
        title="Approve this appointment?"
        description="The applicant is told the visit can go ahead."
        confirmLabel="Approve"
        onClick={approveAppointment}
        open={openApproveAppointment}
        setOpen={setOpenApproveAppointment}
      />

      <ResponsiveAlertDialog
        title="Reject this appointment?"
        description="The applicant is told the visit cannot go ahead."
        confirmLabel="Reject"
        onClick={rejectAppointment}
        open={openRejectAppointment}
        setOpen={setOpenRejectAppointment}
      />
      {/* A pending row answers inline; a decided row keeps the compact menu. */}
      {appointmentStatus === null ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="max-md:h-11"
            disabled={isApproving}
            onClick={() => setOpenApproveAppointment(true)}
          >
            <CircleCheckBigIcon />
            {isApproving ? 'Approving…' : 'Approve'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive max-md:h-11"
            disabled={isRejecting}
            onClick={() => setOpenRejectAppointment(true)}
          >
            <CircleOffIcon />
            {isRejecting ? 'Rejecting…' : 'Reject'}
          </Button>
        </>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Appointment actions"
              className="size-8 max-md:size-11"
            >
              <EllipsisVerticalIcon className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Appointment actions</DropdownMenuLabel>
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
      )}
    </>
  )
}

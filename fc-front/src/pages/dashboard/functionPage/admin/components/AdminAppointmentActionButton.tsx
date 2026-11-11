import { updateAppointmentStatus } from '@/api/notificationApi'
import { notificationsCollection } from '@/db/collections'
import { createTransaction, useLiveQuery } from '@tanstack/react-db'
import {
  CircleCheckBigIcon,
  CircleOffIcon,
  EllipsisVerticalIcon,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { holdTransactionForUndo } from '@/components/undo-action'

type AppointmentData = {
  appointmentId: number
  appointmentStatus: boolean | null
  stallNumber: number
}

// Approve/reject act immediately — no confirmation dialog. The row flips
// optimistically in the collection, a ring counts down, and Undo rolls the
// TanStack DB transaction back so the server is never contacted. When the
// ring runs out the transaction commits and persists the decision.
export default function AdminAppointmentActionButton({
  appointmentId,
  appointmentStatus,
  stallNumber,
}: AppointmentData) {
  // Subscribe so the collection is synced before we write to it — the
  // pages read through useQuery, and nothing else would have loaded the
  // collection data the optimistic update needs.
  useLiveQuery({ query: (q) => q.from({ n: notificationsCollection }) })

  function setStatus(read: boolean) {
    const tx = createTransaction({
      autoCommit: false,
      mutationFn: async () => {
        try {
          await updateAppointmentStatus({
            notificationId: appointmentId,
            notificationRead: read,
            stallNumber,
          })
        } finally {
          await notificationsCollection.utils.refetch()
        }
      },
    })

    tx.mutate(() => {
      notificationsCollection.update(appointmentId, (draft) => {
        draft.notificationRead = read
      })
    })

    holdTransactionForUndo(tx, {
      message: read
        ? `Appointment ${stallNumber} approved`
        : `Appointment ${stallNumber} rejected`,
    })
  }

  return (
    <>
      {/* A pending row answers inline; a decided row keeps the compact menu. */}
      {appointmentStatus === null ? (
        <>
          <Button
            variant="outline"
            size="sm"
            className="max-md:h-11"
            onClick={() => setStatus(true)}
          >
            <CircleCheckBigIcon />
            Approve
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive max-md:h-11"
            onClick={() => setStatus(false)}
          >
            <CircleOffIcon />
            Reject
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
              onClick={() => setStatus(true)}
              disabled={appointmentStatus === true}
              className="flex items-center"
            >
              <CircleCheckBigIcon className="mr-2 h-4 w-4" />
              Approve
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setStatus(false)}
              disabled={appointmentStatus === false}
              className="flex items-center"
            >
              <CircleOffIcon className="mr-2 h-4 w-4" />
              Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </>
  )
}

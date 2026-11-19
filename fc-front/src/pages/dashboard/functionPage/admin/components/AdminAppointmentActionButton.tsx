import { decideAppointment, type AppointmentDecision } from '@/db/actions'
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
import { offerUndo } from '@/components/undo-action'

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
  function setStatus(decision: boolean) {
    const previous: AppointmentDecision = appointmentStatus
    const change = decideAppointment({ id: appointmentId, decision })
    offerUndo(change, {
      message: `Appointment for stall ${stallNumber} ${decision ? 'approved' : 'rejected'}`,
      failed: `Could not save the decision for stall ${stallNumber}. It is back to how it was.`,
      undo: () => decideAppointment({ id: appointmentId, decision: previous }),
    })
  }

  return (
    <>
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

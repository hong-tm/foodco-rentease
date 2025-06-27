import { useState } from 'react'
import { sendReminderEmail } from '@/api/adminApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useMutation } from '@tanstack/react-query'
import { EllipsisVerticalIcon } from 'lucide-react'
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

type UserAction = {
  userName: string
  userEmail: string
  userStallId: number
  userStallName: string
  stallEndAt: Date
}

export function TenantActionButton({
  userName,
  userEmail,
  userStallId,
  userStallName,
  stallEndAt,
}: UserAction) {
  const [openSendReminder, setOpenSendReminder] = useState(false)

  const mutation = useMutation({
    mutationFn: sendReminderEmail,
    onError: () => {
      toast.error('Failed to send reminder email')
    },
    onSuccess: () => {
      toast.success('Reminder email sent successfully')
    },
  })

  async function handlerReminderEmail() {
    const payload = {
      to: userEmail,
      subject: `Payment Reminder for ${userName}`,
      text: `Dear ${userName},\n\nThis is a reminder that your payment is due soon for:\n\nStall Number: ${userStallId}\nStall Name: ${userStallName}\n\nYour stall will end on ${new Date(
        stallEndAt,
      ).toLocaleDateString()}. \n\nPlease make the payment as soon as possible.\n\nThank you!`,
    }
    // console.log("Payload being sent:", payload);

    mutation.mutate(payload)
  }

  return (
    <>
      <DropdownMenu>
        <ResponsiveAlertDialog
          title="Send Reminder Payment Email"
          description="Are you sure you want to send a reminder email to this tenant?"
          onClick={handlerReminderEmail}
          open={openSendReminder}
          setOpen={setOpenSendReminder}
        />

        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tenant Action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setOpenSendReminder(true)}
            disabled={mutation.isPending}
          >
            Send Reminder Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

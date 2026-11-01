import { useState } from 'react'
import { sendReminderEmail } from '@/api/adminApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useMutation } from '@tanstack/react-query'
import { MailIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

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
    mutation.mutate(payload)
  }

  return (
    <>
      <ResponsiveAlertDialog
        title="Send reminder payment email?"
        description={`Goes to ${userEmail} for ${userStallName} (stall ${userStallId}), ending ${new Date(
          stallEndAt,
        ).toLocaleDateString(undefined, {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })}.`}
        confirmLabel="Send reminder"
        onClick={handlerReminderEmail}
        open={openSendReminder}
        setOpen={setOpenSendReminder}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpenSendReminder(true)}
        disabled={mutation.isPending}
      >
        <MailIcon aria-hidden="true" />
        {mutation.isPending ? 'Sending…' : 'Send reminder'}
      </Button>
    </>
  )
}

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
  stallEndAt?: Date | string | null
  /** Overrides the lease reminder, e.g. for one unpaid utility bill. */
  email?: { subject: string; text: string; description: string }
  className?: string
}

export function TenantActionButton({
  userName,
  userEmail,
  userStallId,
  userStallName,
  stallEndAt,
  email,
  className,
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

  function handlerReminderEmail() {
    const endLine = stallEndAt
      ? `Your stall will end on ${new Date(stallEndAt).toLocaleDateString()}.`
      : 'Your stall has no end date set.'
    if (email) {
      mutation.mutate({
        to: userEmail,
        subject: email.subject,
        text: email.text,
      })
      return
    }
    mutation.mutate({
      to: userEmail,
      subject: `Payment Reminder for ${userName}`,
      text: `Dear ${userName},\n\nThis is a reminder that your payment is due soon for:\n\nStall Number: ${userStallId}\nStall Name: ${userStallName}\n\n${endLine} \n\nPlease make the payment as soon as possible.\n\nThank you!`,
    })
  }

  return (
    <>
      <ResponsiveAlertDialog
        title="Send this reminder email?"
        description={
          email?.description ??
          `A payment reminder goes to ${userName} for stall ${userStallId}.`
        }
        confirmLabel="Send reminder"
        onClick={handlerReminderEmail}
        open={openSendReminder}
        setOpen={setOpenSendReminder}
      />
      <Button
        variant="outline"
        size="sm"
        className={className}
        disabled={mutation.isPending}
        aria-label={`Send reminder email to ${userName} for stall ${userStallId}`}
        onClick={() => setOpenSendReminder(true)}
      >
        <MailIcon />
        Remind
      </Button>
    </>
  )
}

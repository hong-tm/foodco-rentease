import { useState } from 'react'
import { sendReminderEmail } from '@/api/adminApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useMutation } from '@tanstack/react-query'
import { MailIcon } from 'lucide-react'
import { toast } from 'sonner'

import { formatDay } from '@/lib/format'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'

type UserAction = {
  userName: string
  userEmail: string
  userStallId: number
  userStallName: string
  stallEndAt: Date
  emphasis?: 'outline' | 'ghost'
}

export function TenantActionButton({
  userName,
  userEmail,
  userStallId,
  userStallName,
  stallEndAt,
  emphasis = 'outline',
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
        description={`Goes to ${userEmail} for ${userStallName} (stall ${userStallId}), ending ${formatDay(stallEndAt)}.`}
        confirmLabel="Send reminder"
        onClick={handlerReminderEmail}
        open={openSendReminder}
        setOpen={setOpenSendReminder}
      />

      <Button
        variant={emphasis}
        size="sm"
        className={cn(
          'focus-visible:ring-foreground/80 focus-visible:ring-1 focus-visible:ring-offset-0',
          emphasis === 'ghost' &&
            'text-muted-foreground opacity-60 transition-opacity group-hover/row:opacity-100 hover:text-foreground focus-visible:opacity-100',
        )}
        onClick={() => setOpenSendReminder(true)}
        disabled={mutation.isPending}
      >
        <MailIcon aria-hidden="true" />
        {mutation.isPending ? 'Sending…' : 'Send reminder'}
      </Button>
    </>
  )
}

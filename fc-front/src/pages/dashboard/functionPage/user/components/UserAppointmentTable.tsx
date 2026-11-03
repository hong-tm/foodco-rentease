import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import { getUserNotificationQueryOptions } from '@/api/notificationApi'
import {
  createPaymentIntent,
  getAllPaymentRecordsQueryOptions,
  paymentsQueryKey,
} from '@/api/paymentApi'
import type { GetStallsResponse } from '@/api/stallApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import type { NotificationAttributes } from '@server/db/userModel'
import type {
  PaymentIntentResponse,
  PaymentNotification,
} from '@server/lib/sharedType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { formatDay } from '@/lib/format'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import PaymentModal from '@/components/PaymentModal'
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import { SpecStrip } from '@/components/dashboard/SpecStrip'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

type PaymentIntentParams = {
  amount: number
  stallId: number
  userId: string
}

export default function UserAppointmentTable() {
  const { data: session } = useSession()
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [clientSecret, setClientSecret] = useState('')
  const [selectedNotification, setSelectedNotification] =
    useState<PaymentNotification | null>(null)
  const queryClient = useQueryClient()

  const { data: stalls } = useQuery<GetStallsResponse>(fetchStallsQueryOptions)
  const { data: payments } = useQuery(getAllPaymentRecordsQueryOptions)
  const {
    data: notifications,
    error,
    isLoading,
    refetch,
  } = useQuery({
    ...getUserNotificationQueryOptions,
    queryKey: ['get-user-notifications', session?.user?.id],
  })

  const paymentMutation = useMutation<
    PaymentIntentResponse,
    Error,
    PaymentIntentParams
  >({
    mutationFn: ({ amount, stallId, userId }) =>
      createPaymentIntent(amount, stallId, userId),
    onSuccess: (data) => {
      setClientSecret(data.clientSecret)
      setIsPaymentModalOpen(true)
      queryClient.invalidateQueries({ queryKey: paymentsQueryKey.record() })
    },
    onError: (error: Error) => {
      console.error('Error creating payment:', error)
      toast.error('Failed to initiate payment')
    },
  })

  const calculateAmount = (notification: PaymentNotification) => {
    if (!stalls) return 0

    const stall = stalls.stall.find(
      (stall) => stall.stallNumber === notification.stallNumber,
    )

    if (!stall) return 0

    const tierPrice =
      typeof stall.stallTierNumber.tierPrice === 'number'
        ? stall.stallTierNumber.tierPrice
        : parseFloat(stall.stallTierNumber.tierPrice)
    const stallSize =
      typeof stall.stallSize === 'number'
        ? stall.stallSize
        : parseFloat(stall.stallSize)

    return tierPrice * stallSize
  }

  const handlePaymentClick = async (notification: PaymentNotification) => {
    if (!notification.stallNumber) {
      toast.error('No stall number provided')
      return
    }

    if (!session?.user?.id) {
      toast.error('User not logged in')
      return
    }

    const amount = calculateAmount(notification)
    setSelectedNotification({
      ...notification,
      userId: session.user.id,
    })

    paymentMutation.mutate({
      amount,
      stallId: notification.stallNumber,
      userId: session.user.id,
    })
  }

  // Paid means this user paid for this stall. Other tenants' payments on the
  // same stall do not count (they used to, marking strangers' bookings paid).
  const getPaymentStatus = (stallId: number) => {
    return payments?.some(
      (payment) =>
        payment.stallId === stallId &&
        payment.userId === session?.user?.id &&
        payment.paymentStatus,
    )
  }

  const appointments = notifications ?? []
  // Only an approved appointment can be paid, which keeps the strip's
  // Pending / Awaiting payment / Paid / Rejected counts disjoint.
  const isPaid = (notification: NotificationAttributes) =>
    notification.notificationRead === true &&
    Boolean(
      notification.stallNumber && getPaymentStatus(notification.stallNumber),
    )
  const isAwaitingPayment = (notification: NotificationAttributes) =>
    notification.notificationRead === true &&
    Boolean(notification.stallNumber) &&
    !isPaid(notification)

  const pendingCount = appointments.filter(
    (notification) => notification.notificationRead === null,
  ).length
  const awaitingPaymentCount = appointments.filter(isAwaitingPayment).length
  const paidCount = appointments.filter(isPaid).length
  const rejectedCount = appointments.filter(
    (notification) => notification.notificationRead === false,
  ).length

  const specStrip = (
    <SpecStrip
      value={String(appointments.length)}
      unit={appointments.length === 1 ? 'appointment' : 'appointments'}
      cells={[
        { label: 'Pending', value: pendingCount },
        {
          label: 'Awaiting payment',
          value: awaitingPaymentCount,
          anomaly: awaitingPaymentCount > 0,
        },
        { label: 'Paid', value: paidCount },
        { label: 'Rejected', value: rejectedCount },
      ]}
    />
  )

  if (isLoading) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-6">
        <span className="sr-only">Loading your appointments…</span>
        <Skeleton className="h-24 w-full" aria-hidden="true" />
        {[0, 1, 2].map((row) => (
          <Skeleton key={row} className="h-12 w-full" aria-hidden="true" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
      >
        <p>Your appointments could not be loaded.</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (appointments.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {specStrip}
        <p className="text-muted-foreground text-sm">
          You have no appointments yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {specStrip}
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-table">
          <TableCaption className="sr-only">
            Your appointment requests with status and payment action
          </TableCaption>
          <TableHeader>
            <TableRow className="border-border bg-muted/35 border-b hover:bg-transparent">
              <TableHead
                className={`type-label text-muted-foreground h-12 w-10 pl-6`}
              >
                <span className="sr-only">You</span>
              </TableHead>
              <TableHead className={`type-label text-muted-foreground h-12`}>
                Message
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground h-12`}
                style={{ width: '12%' }}
              >
                Date
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground h-12`}
                style={{ width: '14%' }}
              >
                Status
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground h-12 pr-6 text-right`}
                style={{ width: '20%' }}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((notification) => {
              const approved = notification.notificationRead === true
              const status =
                notification.notificationRead === null
                  ? 'Pending'
                  : approved
                    ? 'Approved'
                    : 'Rejected'
              const paid = isPaid(notification)
              return (
                <TableRow
                  key={notification.notificationId}
                  className="border-border hover:bg-muted/20"
                >
                  <TableCell className="py-4 pl-6 align-baseline">
                    <InitialsAvatar
                      name={session?.user?.name ?? 'You'}
                      image={session?.user?.image}
                    />
                  </TableCell>
                  <TableCell className="py-4 pr-4 align-baseline">
                    <span className="text-sm font-medium whitespace-normal">
                      {notification.notificationMessage}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 align-baseline">
                    <span className="text-muted-foreground text-sm tabular-nums">
                      {formatDay(notification.appointmentDate)}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 align-baseline">
                    <StatusBadge
                      label={status}
                      tone={
                        notification.notificationRead === false
                          ? 'blocked'
                          : approved && paid
                            ? 'settled'
                            : 'action'
                      }
                    />
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right align-baseline">
                    {approved && notification.stallNumber ? (
                      paid ? (
                        <StatusBadge label="Payment completed" tone="settled" />
                      ) : (
                        <Button
                          size="sm"
                          onClick={() =>
                            handlePaymentClick({
                              ...notification,
                              notificationerror: '',
                            })
                          }
                          disabled={paymentMutation.isPending}
                        >
                          {paymentMutation.isPending
                            ? 'Processing...'
                            : `Pay RM ${calculateAmount({
                                ...notification,
                                notificationerror: '',
                              }).toFixed(2)}`}
                        </Button>
                      )
                    ) : null}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {clientSecret && selectedNotification && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false)
            setClientSecret('')
          }}
          clientSecret={clientSecret}
          amount={calculateAmount(selectedNotification)}
          stallId={selectedNotification.stallNumber || 0}
          userId={selectedNotification.userId?.toString() || ''}
          paymentType="rental"
        />
      )}
    </div>
  )
}

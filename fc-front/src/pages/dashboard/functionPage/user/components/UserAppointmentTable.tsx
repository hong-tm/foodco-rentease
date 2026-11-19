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
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import type {
  PaymentIntentResponse,
  PaymentNotification,
} from '@server/lib/sharedType'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format } from 'date-fns'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'

import { formatRM } from '@/lib/format'
import { payRows } from '@/lib/pay-rows'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'
import PaymentModal from '@/components/PaymentModal'

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
  } = useQuery({
    ...getUserNotificationQueryOptions,
    queryKey: ['get-user-notifications', session?.user?.id],
    enabled: Boolean(session?.user?.id),
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
      toast.error('Payment could not start', {
        description: 'Nothing was charged. Try again in a moment.',
      })
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

  const getPaymentStatus = (stallId: number) => {
    return payments?.some(
      (payment) =>
        payment.stallId === stallId &&
        payment.userId === session?.user?.id &&
        payment.paymentStatus,
    )
  }

  const rows = notifications ?? []
  const payRow = payRows(rows, (stall) => Boolean(getPaymentStatus(stall)))
  const pending = rows.filter(
    (notification) => notification.notificationRead === null,
  )

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Appointments"
        actions={
          <Button variant="outline" asChild>
            <Link to="/dashboard/stall-availability">Apply for a stall</Link>
          </Button>
        }
      >
        {isLoading || error
          ? 'Your stall viewings and their status.'
          : rows.length === 0
            ? 'You have no appointments yet. Pick a free stall to book one.'
            : [
                `${rows.length} appointment${rows.length === 1 ? '' : 's'}.`,
                payRow.size > 0
                  ? `${payRow.size} stall${payRow.size === 1 ? '' : 's'} approved and waiting for your first payment.`
                  : '',
                pending.length > 0
                  ? `${pending.length} still waiting for the admin.`
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
      </PageHeader>

      <Panel className="gap-0 pb-0 md:pb-0">
        <PanelHeader
          className="pb-3"
          title="Your appointments"
          meta="Approved stalls need the first rental payment to start the lease"
        />
        {isLoading ? (
          <div className="pb-4 md:pb-5">
            <PanelRowsSkeleton rows={3} />
          </div>
        ) : error ? (
          <div className="pb-4 md:pb-5">
            <PanelError what="your appointments" />
          </div>
        ) : rows.length === 0 ? (
          <div className="pb-4 md:pb-5">
            <PanelEmpty>No appointments yet.</PanelEmpty>
          </div>
        ) : (
          <ul className="-mx-4 divide-y border-t md:-mx-5">
            {rows.map((notification) => {
              const date = new Date(notification.appointmentDate)
              const status =
                notification.notificationRead === null
                  ? 'pending'
                  : notification.notificationRead
                    ? 'approved'
                    : 'rejected'
              const paid = notification.stallNumber
                ? getPaymentStatus(notification.stallNumber)
                : false
              const amount = calculateAmount({
                ...notification,
                notificationerror: '',
              })
              const payOn = notification.stallNumber
                ? payRow.get(notification.stallNumber)
                : undefined
              const starting =
                paymentMutation.isPending &&
                paymentMutation.variables?.stallId === notification.stallNumber
              return (
                <li
                  key={notification.notificationId}
                  className="flex min-h-15 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3.5 md:px-5"
                >
                  <time
                    dateTime={date.toISOString()}
                    className="bg-muted flex size-11 shrink-0 flex-col items-center justify-center rounded-lg leading-none"
                  >
                    <span className="type-strong">{date.getDate()}</span>
                    <span className="type-meta text-muted-foreground">
                      {format(date, 'MMM')}
                    </span>
                  </time>
                  <div className="min-w-0 flex-1">
                    <p className="type-body truncate font-medium">
                      {notification.stallNumber
                        ? `Stall ${notification.stallNumber}`
                        : 'Stall viewing'}
                    </p>
                    <p className="type-meta text-muted-foreground truncate">
                      {date.getFullYear() !== new Date().getFullYear() &&
                        `${date.getFullYear()} · `}
                      {notification.notificationMessage}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 max-md:w-full max-md:justify-between max-md:pl-15">
                    <Badge
                      variant={
                        status === 'pending'
                          ? 'warning'
                          : status === 'approved'
                            ? 'positive'
                            : 'negative'
                      }
                    >
                      {status === 'pending'
                        ? 'Pending'
                        : status === 'approved'
                          ? 'Approved'
                          : 'Rejected'}
                    </Badge>
                    {status === 'approved' && notification.stallNumber ? (
                      paid ? (
                        <span className="type-meta text-muted-foreground flex w-36 items-center justify-end gap-1">
                          <CheckIcon
                            aria-hidden="true"
                            className="text-positive size-3.5"
                          />
                          Paid
                        </span>
                      ) : payOn &&
                        payOn.notificationId !== notification.notificationId ? (
                        <span className="type-meta text-muted-foreground w-36 text-right">
                          Same stall · see{' '}
                          {format(new Date(payOn.appointmentDate), 'd MMM')}
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          className="w-36 max-md:min-h-11"
                          onClick={() =>
                            handlePaymentClick({
                              ...notification,
                              notificationerror: '',
                            })
                          }
                          disabled={paymentMutation.isPending}
                        >
                          {starting ? 'Starting…' : `Pay ${formatRM(amount)}`}
                        </Button>
                      )
                    ) : (
                      <span aria-hidden="true" className="w-36 max-md:hidden" />
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </Panel>

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

import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import {
  createPaymentIntent,
  getAllPaymentRecordsQueryOptions,
} from '@/api/paymentApi'
import { fetchStallCurrentQueryOptions } from '@/api/stallApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import PaymentModal from '@/components/PaymentModal'
import { SpecStrip } from '@/components/dashboard/SpecStrip'

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

type BillState = 'paid' | 'due' | 'none' | 'unset'

type Bill = {
  type: 'water' | 'electric' | 'rental'
  label: string
  amount: number
  state: BillState
  meta: string
  paymentId?: string
}

function toAmount(value?: string | number | null) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return amount !== undefined && amount !== null && Number.isFinite(amount)
    ? amount
    : 0
}

function money(value: number) {
  return value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export default function StallUtilitiesDetails() {
  const { data: session, isLoading: isSessionLoading } = useSession()
  const userId = session?.user?.id

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<{
    type: string
    amount: number
    stallId: number
    paymentId?: string
  } | null>(null)
  const [clientSecret, setClientSecret] = useState('')

  const {
    data: stallData,
    isLoading: isStallLoading,
    error: stallError,
    refetch: refetchStalls,
  } = useQuery(fetchStallCurrentQueryOptions(userId || ''))

  const {
    data: paymentRecords,
    isLoading: isPaymentLoading,
    error: paymentError,
    refetch: refetchPayments,
  } = useQuery(getAllPaymentRecordsQueryOptions)

  const handlePayment = async (
    type: string,
    amount: number,
    stallId: number,
    paymentId: string,
  ) => {
    if (!userId) return

    try {
      const response = await createPaymentIntent(amount, stallId, userId)
      setClientSecret(response.clientSecret)
      setSelectedPayment({ type, amount, stallId, paymentId })
      setIsPaymentModalOpen(true)
    } catch (error) {
      console.error('Error creating payment intent:', error)
    }
  }

  if (isSessionLoading || isStallLoading || isPaymentLoading) {
    return (
      <div role="status" aria-live="polite" className="flex flex-col gap-6">
        <span className="sr-only">Loading your stalls…</span>
        <div className="flex flex-col gap-3" aria-hidden="true">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        {[0, 1].map((card) => (
          <div
            key={card}
            aria-hidden="true"
            className="border-border flex flex-col gap-4 rounded-xl border p-6"
          >
            <Skeleton className="h-5 w-56" />
            {[0, 1, 2].map((row) => (
              <div key={row} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="ml-auto h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (!userId) {
    return (
      <p className="text-muted-foreground text-sm">
        Sign in to see the utilities for your stalls.
      </p>
    )
  }

  if (stallError || paymentError) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
      >
        <p>Utilities could not be loaded. Please try again.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetchStalls()
            refetchPayments()
          }}
        >
          Retry
        </Button>
      </div>
    )
  }

  const stalls = stallData?.stalls ?? []

  if (stalls.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">
        No stall is registered under your account yet.
      </p>
    )
  }

  const records: PaymentRecord[] = paymentRecords ?? []

  // Most recent record of this type for the stall. Records arrive in no
  // guaranteed order, so pick by date rather than taking the first match.
  const latestOf = (stallNumber: number, type: Bill['type']) =>
    records
      .filter(
        (payment) =>
          payment.stallId === stallNumber && payment.paymentType === type,
      )
      .reduce<
        PaymentRecord | undefined
      >((latest, payment) => (!latest || new Date(payment.paymentDate) > new Date(latest.paymentDate) ? payment : latest), undefined)

  // Rent is monthly: it counts as paid only when this month's rent is in.
  const now = new Date()
  const paidThisMonth = (record?: PaymentRecord) => {
    if (!record?.paymentStatus) return false
    const date = new Date(record.paymentDate)
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth()
    )
  }

  const billsFor = (stall: (typeof stalls)[number]): Bill[] => {
    const bills: Bill[] = []

    for (const type of ['water', 'electric'] as const) {
      const record = latestOf(stall.stallNumber, type)
      const label = type === 'water' ? 'Water' : 'Electricity'
      if (!record) {
        bills.push({
          type,
          label,
          amount: 0,
          state: 'none',
          meta: 'No bill issued yet',
        })
        continue
      }
      const amount = toAmount(record.paymentAmount)
      bills.push({
        type,
        label,
        amount,
        state: record.paymentStatus ? 'paid' : 'due',
        meta: record.paymentStatus
          ? `Paid ${formatDay(record.paymentDate)}`
          : `Charged ${formatDay(record.paymentDate)}`,
        paymentId: record.paymentId,
      })
    }

    const tierPrice = stall.stallTierNumber?.tierPrice
    const size = stall.stallSize
    const rentalAmount = tierPrice ? toAmount(tierPrice) * toAmount(size) : 0
    const rentalRecord = latestOf(stall.stallNumber, 'rental')

    if (!tierPrice || !size) {
      bills.push({
        type: 'rental',
        label: 'Rental',
        amount: 0,
        state: 'unset',
        meta: 'No tier or floor area recorded',
      })
    } else {
      bills.push({
        type: 'rental',
        label: 'Rental',
        amount: rentalAmount,
        state: paidThisMonth(rentalRecord) ? 'paid' : 'due',
        meta: paidThisMonth(rentalRecord)
          ? `Paid ${formatDay(rentalRecord!.paymentDate)}`
          : rentalRecord?.paymentStatus
            ? `Last paid ${formatDay(rentalRecord.paymentDate)} · ${toAmount(size)} m² × RM ${money(toAmount(tierPrice))} a month`
            : `${toAmount(size)} m² × RM ${money(toAmount(tierPrice))} a month`,
        // Settle an open rent bill in place. When the last rent is already
        // paid (a previous month), paying must create this month's record:
        // re-marking the old paid record would charge again and never clear.
        paymentId:
          rentalRecord && !rentalRecord.paymentStatus
            ? rentalRecord.paymentId
            : undefined,
      })
    }

    return bills
  }

  const stallBills = stalls.map((stall) => ({
    stall,
    bills: billsFor(stall),
  }))

  const dueBills = stallBills.flatMap(({ stall, bills }) =>
    bills
      .filter((bill) => bill.state === 'due')
      .map((bill) => ({ ...bill, stallNumber: stall.stallNumber })),
  )
  const totalDue = dueBills.reduce((sum, bill) => sum + bill.amount, 0)
  const stallsWithDue = new Set(dueBills.map((bill) => bill.stallNumber)).size

  return (
    <div className="flex flex-col gap-8">
      <section aria-label="Amount due">
        <SpecStrip
          value={
            dueBills.length === 0 ? 'Nothing due' : `RM ${money(totalDue)}`
          }
          unit={
            dueBills.length === 0
              ? 'every bill settled'
              : dueBills.length === 1
                ? 'bill due'
                : 'bills due'
          }
          cells={[
            { label: 'Stalls', value: stalls.length },
            {
              label: 'Bills due',
              value: dueBills.length,
              anomaly: dueBills.length > 0,
            },
            { label: 'Stalls with bills due', value: stallsWithDue },
          ]}
        />
      </section>

      <div className="flex flex-col gap-6">
        {stallBills.map(({ stall, bills }) => {
          const due = bills.filter((bill) => bill.state === 'due')
          return (
            <section
              key={stall.stallNumber}
              aria-label={`Stall ${stall.stallNumber}`}
              className="border-border rounded-xl border"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-6 py-5">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="text-base font-medium tabular-nums">
                    Stall {stall.stallNumber}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {stall.stallName}
                  </p>
                </div>
                <div className="flex flex-wrap items-baseline gap-3">
                  <p className="text-muted-foreground text-xs tabular-nums">
                    {stall.stallTierNumber?.tierName ?? 'No tier'} ·{' '}
                    {stall.stallSize
                      ? `${toAmount(stall.stallSize)} m²`
                      : 'area not recorded'}
                  </p>
                  {due.length === 0 ? (
                    <span className={labelClass}>Settled</span>
                  ) : (
                    <Badge
                      variant="outline"
                      className="font-medium tabular-nums"
                    >
                      {due.length} due
                    </Badge>
                  )}
                </div>
              </header>

              <ul className="divide-border/60 divide-y border-t">
                {bills.map((bill) => (
                  <li
                    key={bill.type}
                    className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <span className="text-sm font-medium">{bill.label}</span>
                      <span className="text-muted-foreground text-xs tabular-nums">
                        {bill.meta}
                      </span>
                    </div>

                    <span className="ml-auto text-sm font-medium tabular-nums">
                      {bill.state === 'none' || bill.state === 'unset'
                        ? '—'
                        : `RM ${money(bill.amount)}`}
                    </span>

                    <div className="w-16 text-right">
                      {bill.state === 'due' && (
                        <Button
                          size="sm"
                          variant="outline"
                          aria-label={`Pay ${bill.label.toLowerCase()} bill, RM ${money(bill.amount)}`}
                          onClick={() =>
                            handlePayment(
                              bill.type,
                              bill.amount,
                              stall.stallNumber,
                              bill.paymentId || '',
                            )
                          }
                        >
                          Pay
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>

      {selectedPayment && clientSecret && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          clientSecret={clientSecret}
          amount={selectedPayment.amount}
          stallId={selectedPayment.stallId}
          userId={userId || ''}
          paymentType={selectedPayment.type}
          originalPaymentId={selectedPayment.paymentId}
        />
      )}
    </div>
  )
}

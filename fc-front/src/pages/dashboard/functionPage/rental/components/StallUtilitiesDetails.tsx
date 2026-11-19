import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import {
  createPaymentIntent,
  getAllPaymentRecordsQueryOptions,
} from '@/api/paymentApi'
import { fetchStallCurrentQueryOptions } from '@/api/stallApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckIcon } from 'lucide-react'
import { toast } from 'sonner'

import { formatDate, formatRM, formatSize } from '@/lib/format'
import { stallLabel } from '@/lib/stall-lease'

import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'
import PaymentModal from '@/components/PaymentModal'

import { billsDue, stallBills, type Bill } from '../bills'

function BillCell({
  bill,
  starting,
  busy,
  onPay,
}: {
  bill: Bill
  starting: boolean
  busy: boolean
  onPay: () => void
}) {
  const paid = Boolean(bill.record?.paymentStatus)
  const more = bill.unpaidCount - 1
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <span className="type-meta text-muted-foreground flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="size-2 shrink-0 rounded-xs"
          style={{ background: bill.color }}
        />
        {bill.label}
      </span>
      <span className="type-body font-medium tabular-nums">
        {bill.amount > 0 ? formatRM(bill.amount) : '—'}
      </span>
      {bill.amount <= 0 ? (
        <span className="type-meta text-muted-foreground">{bill.missing}</span>
      ) : paid ? (
        <span className="type-meta text-muted-foreground flex items-center gap-1 whitespace-nowrap">
          <CheckIcon aria-hidden="true" className="text-positive size-3.5" />
          <span className="max-md:sr-only">Paid </span>
          {formatDate(bill.record!.paymentDate)}
        </span>
      ) : (
        <>
          <Button
            size="sm"
            className="self-start max-md:min-h-11"
            disabled={busy}
            onClick={onPay}
          >
            {starting ? 'Starting…' : `Pay ${bill.label.toLowerCase()}`}
          </Button>
          {more > 0 && (
            <span className="type-meta text-warning-ink">
              {more} more unpaid
            </span>
          )}
        </>
      )}
    </div>
  )
}

export default function StallUtilitiesDetails() {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<{
    type: string
    amount: number
    stallId: number
    paymentId?: string
  } | null>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [startingKey, setStartingKey] = useState<string | null>(null)

  const stallsQuery = useQuery({
    ...fetchStallCurrentQueryOptions(userId || ''),
    enabled: Boolean(userId),
  })
  const paymentsQuery = useQuery(getAllPaymentRecordsQueryOptions)

  const handlePayment = async (
    type: string,
    amount: number,
    stallId: number,
    paymentId: string,
  ) => {
    if (!userId || startingKey) return
    setStartingKey(`${stallId}-${type}`)
    try {
      const response = await createPaymentIntent(amount, stallId, userId)
      setClientSecret(response.clientSecret)
      setSelectedPayment({ type, amount, stallId, paymentId })
      setIsPaymentModalOpen(true)
    } catch {
      toast.error('Could not start the payment. Try again.')
    } finally {
      setStartingKey(null)
    }
  }

  const stalls = (stallsQuery.data?.stalls ?? []).filter(
    (stall) => stall.rentStatus,
  )
  const rows = stalls.map((stall) => ({
    stall,
    bills: stallBills(stall, paymentsQuery.data ?? [], userId ?? ''),
  }))
  const due = billsDue(rows.flatMap(({ bills }) => bills))
  const isLoading = stallsQuery.isLoading || paymentsQuery.isLoading
  const error = stallsQuery.error || paymentsQuery.error

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Utilities"
        actions={
          <Button variant="outline" asChild>
            <Link to="/dashboard/rental-report">Payment records</Link>
          </Button>
        }
      >
        {isLoading || error
          ? 'Rent, water and electric bills for your stalls.'
          : due.count > 0
            ? `${due.count} bill${due.count === 1 ? '' : 's'} to pay, ${formatRM(due.total)} in total.`
            : stalls.length === 0
              ? 'You hold no stalls, so there are no bills.'
              : `Every bill is paid across your ${stalls.length} stall${stalls.length === 1 ? '' : 's'}.`}
      </PageHeader>

      <Panel className="gap-0 pb-0 md:pb-0">
        <PanelHeader
          className="pb-3"
          title="Bills"
          meta="Oldest unpaid bill first, otherwise the latest one"
        />
        {isLoading ? (
          <div className="pb-4 md:pb-5">
            <PanelRowsSkeleton rows={3} />
          </div>
        ) : error ? (
          <div className="pb-4 md:pb-5">
            <PanelError
              what="your bills"
              onRetry={() => {
                stallsQuery.refetch()
                paymentsQuery.refetch()
              }}
            />
          </div>
        ) : rows.length === 0 ? (
          <div className="pb-4 md:pb-5">
            <PanelEmpty>You hold no stalls, so there are no bills.</PanelEmpty>
          </div>
        ) : (
          <ul className="-mx-4 divide-y border-t md:-mx-5">
            {rows.map(({ stall, bills }) => (
              <li
                key={stall.stallNumber}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-4 gap-y-3 px-4 py-4 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,2fr)] md:px-5"
              >
                <span className="bg-muted type-section grid size-11 place-items-center rounded-lg border tabular-nums">
                  {stall.stallNumber}
                </span>
                <div className="min-w-0 self-center">
                  <p className="type-body truncate font-medium">
                    {stallLabel(stall)}
                  </p>
                  <p className="type-meta text-muted-foreground truncate">
                    Stall {stall.stallNumber} · {formatSize(stall.stallSize)}
                  </p>
                </div>
                <div className="col-span-full grid grid-cols-3 gap-4 md:col-span-1">
                  {bills.map((bill) => (
                    <BillCell
                      key={bill.kind}
                      bill={bill}
                      starting={
                        startingKey === `${stall.stallNumber}-${bill.kind}`
                      }
                      busy={startingKey !== null}
                      onPay={() =>
                        handlePayment(
                          bill.kind,
                          bill.amount,
                          stall.stallNumber,
                          bill.record?.paymentId || '',
                        )
                      }
                    />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

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

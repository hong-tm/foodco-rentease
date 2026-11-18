import { useState } from 'react'
import { useSession } from '@/api/adminApi'
import {
  createPaymentIntent,
  getAllPaymentRecordsQueryOptions,
  type PaymentRecord,
} from '@/api/paymentApi'
import {
  fetchStallCurrentQueryOptions,
  type GetStallCurrentResponse,
} from '@/api/stallApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckIcon } from 'lucide-react'

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

type BillKind = 'water' | 'electric' | 'rental'
type LeasedStall = GetStallCurrentResponse['stalls'][number]
type Bill = {
  kind: BillKind
  label: string
  color: string
  amount: number
  record?: PaymentRecord
  missing: string
}

const kinds: { kind: BillKind; label: string; color: string }[] = [
  { kind: 'rental', label: 'Rental fee', color: 'var(--chart-1)' },
  { kind: 'electric', label: 'Electric', color: 'var(--chart-3)' },
  { kind: 'water', label: 'Water', color: 'var(--chart-2)' },
]

function billsOf(stall: LeasedStall, records: PaymentRecord[]): Bill[] {
  return kinds.map(({ kind, label, color }) => {
    const record = records.find(
      (payment) =>
        payment.stallId === stall.stallNumber && payment.paymentType === kind,
    )
    const amount =
      kind === 'rental'
        ? Number(stall.stallTierNumber?.tierPrice ?? 0) *
          Number(stall.stallSize ?? 0)
        : Number(record?.paymentAmount ?? 0)
    return {
      kind,
      label,
      color,
      amount,
      record,
      missing: kind === 'rental' ? 'No fee set' : 'No bill yet',
    }
  })
}

function BillCell({ bill, onPay }: { bill: Bill; onPay: () => void }) {
  const paid = Boolean(bill.record?.paymentStatus)
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
        <span className="type-meta text-muted-foreground flex items-center gap-1">
          <CheckIcon aria-hidden="true" className="text-positive size-3.5" />
          Paid {formatDate(bill.record!.paymentDate)}
        </span>
      ) : (
        <Button size="sm" className="self-start" onClick={onPay}>
          Pay {bill.label.toLowerCase()}
        </Button>
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

  const stalls = stallsQuery.data?.stalls ?? []
  const rows = stalls.map((stall) => ({
    stall,
    bills: billsOf(stall, paymentsQuery.data ?? []),
  }))
  const due = rows.flatMap(({ bills }) =>
    bills.filter((bill) => bill.amount > 0 && !bill.record?.paymentStatus),
  )
  const dueTotal = due.reduce((sum, bill) => sum + bill.amount, 0)
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
          : due.length > 0
            ? `${due.length} bill${due.length === 1 ? '' : 's'} to pay, ${formatRM(dueTotal)} in total.`
            : `Every bill is paid across your ${stalls.length} stall${stalls.length === 1 ? '' : 's'}.`}
      </PageHeader>

      <Panel className="gap-0 pb-0 md:pb-0">
        <PanelHeader
          className="pb-3"
          title="Latest bills"
          meta="The most recent bill of each kind, per stall"
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

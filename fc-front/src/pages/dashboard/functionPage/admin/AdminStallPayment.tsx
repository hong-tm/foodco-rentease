import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/dashboard/PageHeader'

import StallUtilitiesForm from './components/StallUtilitiesForm'
import StallUtilitiesPaymentTable from './components/StallUtilitiesPaymentTable'

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

function amountOf(value?: string | number | null) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return Number.isFinite(amount as number) ? (amount as number) : 0
}

export function AdminStallPayment() {
  const { data: payments, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  const utilityCharges = (payments ?? []).filter(
    (payment) =>
      payment.paymentType === 'water' || payment.paymentType === 'electric',
  )
  const unpaid = utilityCharges.filter((payment) => !payment.paymentStatus)
  const unpaidTotal = unpaid.reduce(
    (sum, payment) => sum + amountOf(payment.paymentAmount),
    0,
  )

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Stall Utilities"
        description="Charge water or electricity to a stall, and see which charges are still unpaid."
      />

      <section aria-label="Unpaid utilities" className="flex flex-col gap-3">
        {isLoading ? (
          <Skeleton className="h-8 w-48" />
        ) : (
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-3xl leading-none font-semibold tracking-tight tabular-nums">
              RM{' '}
              {unpaidTotal.toLocaleString('en-MY', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className={labelClass}>
              unpaid across {unpaid.length}{' '}
              {unpaid.length === 1 ? 'charge' : 'charges'}
            </span>
          </div>
        )}
      </section>

      <StallUtilitiesForm />
      <StallUtilitiesPaymentTable />
    </div>
  )
}

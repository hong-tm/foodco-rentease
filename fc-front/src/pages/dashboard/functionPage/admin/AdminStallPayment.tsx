import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { toAmount } from '@/lib/format'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SpecStrip } from '@/components/dashboard/SpecStrip'

import StallUtilitiesForm from './components/StallUtilitiesForm'
import StallUtilitiesPaymentTable from './components/StallUtilitiesPaymentTable'

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
    (sum, payment) => sum + toAmount(payment.paymentAmount),
    0,
  )

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Stall Payment"
        description="Charge water or electricity to a stall, and see which charges are still unpaid."
      />

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <SpecStrip
          value={`RM ${unpaidTotal.toLocaleString('en-MY', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          unit="unpaid"
          cells={[
            {
              label: 'Charges',
              value: `${unpaid.length} open`,
              anomaly: unpaid.length > 0,
            },
            {
              label: 'Water',
              value: unpaid.filter((p) => p.paymentType === 'water').length,
            },
            {
              label: 'Electric',
              value: unpaid.filter((p) => p.paymentType === 'electric').length,
            },
          ]}
        />
      )}

      <StallUtilitiesForm />
      <StallUtilitiesPaymentTable />
    </div>
  )
}

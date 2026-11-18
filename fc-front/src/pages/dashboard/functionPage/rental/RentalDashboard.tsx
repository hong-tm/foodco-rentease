import { useSession } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { fetchStallCurrentQueryOptions } from '@/api/stallApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { formatRM } from '@/lib/format'
import { byEndDate, stallLabel, timeLeftLabel } from '@/lib/stall-lease'

import { Button } from '@/components/ui/button'

import RentalPaymentDetail from './components/RentalPaymentDetail'
import RentalStallsDetail from './components/RentalStallsDetail'

export function RentalDashboard() {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? ''
  const stallsQuery = useQuery({
    ...fetchStallCurrentQueryOptions(userId),
    enabled: Boolean(userId),
  })
  const paymentsQuery = useQuery({
    ...getAllPaymentRecordsQueryOptions,
    enabled: Boolean(userId),
  })

  const stalls = (stallsQuery.data?.stalls ?? [])
    .filter((stall) => stall.rentStatus)
    .sort(byEndDate)
  const payments = (paymentsQuery.data ?? []).filter(
    (payment) => payment.userId === userId,
  )
  const unpaid = payments.filter((payment) => !payment.paymentStatus)
  const unpaidTotal = unpaid.reduce(
    (sum, payment) => sum + Number(payment.paymentAmount),
    0,
  )
  const next = stalls[0]

  const finding = stallsQuery.data
    ? [
        stalls.length === 0
          ? 'You hold no stalls yet.'
          : `${stalls.length} stall${stalls.length === 1 ? '' : 's'} on lease. ${stallLabel(next)} ends first: ${timeLeftLabel(next.endAt).toLowerCase()}.`,
        paymentsQuery.data
          ? unpaid.length > 0
            ? `${formatRM(unpaidTotal)} unpaid across ${unpaid.length} bill${unpaid.length === 1 ? '' : 's'}.`
            : 'Every bill is paid.'
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    : 'Your leases and what you have paid.'

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Your stalls"
        actions={
          unpaid.length > 0 ? (
            <Button asChild>
              <Link to="/dashboard/stall-utilities">Pay bills</Link>
            </Button>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/dashboard/stall-availability">Apply for a stall</Link>
            </Button>
          )
        }
      >
        {finding}
      </PageHeader>
      <RentalStallsDetail
        stalls={stalls}
        isLoading={stallsQuery.isLoading}
        error={Boolean(stallsQuery.error)}
        onRetry={() => stallsQuery.refetch()}
      />
      <RentalPaymentDetail
        payments={payments}
        isLoading={paymentsQuery.isLoading}
        error={Boolean(paymentsQuery.error)}
        onRetry={() => paymentsQuery.refetch()}
      />
    </div>
  )
}

import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { PaymentRecordsTable } from '@/components/PaymentRecordsTable'
import { PageHeader } from '@/components/dashboard/PageHeader'

export function AdminReportPage() {
  const { data: records, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Payments"
        description="Rental, water and electricity charges across every stall."
      />
      <PaymentRecordsTable
        title="Records"
        description="Filter by month or type."
        records={records || []}
        showMonthFilter={true}
        isLoading={isLoading}
      />
    </div>
  )
}

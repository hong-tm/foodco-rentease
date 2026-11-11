import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { PaymentRecordsTable } from '@/components/PaymentRecordsTable'

export function AdminReportPage() {
  const { data: records, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  return (
    <PaymentRecordsTable
      title="Financial report"
      description="Payments for all stalls: what came in, what is still owed, and the records behind it."
      records={records || []}
      showMonthFilter={true}
      isLoading={isLoading}
    />
  )
}

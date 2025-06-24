import { useSession } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { PaymentRecordsTable } from '@/components/PaymentRecordsTable'

export function RentalReportPage() {
  const { data: session } = useSession()
  const { data: records, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  const userRecords =
    records?.filter((record) => record.userId === session?.user?.id) || []

  return (
    <PaymentRecordsTable
      title="Rental Records"
      description="Monthly rental records for your stalls"
      records={userRecords}
      showMonthFilter={true}
      isLoading={isLoading}
    />
  )
}

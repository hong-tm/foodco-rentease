import { useSession } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { PaymentRecordsTable } from '@/components/PaymentRecordsTable'

export function UserReportPage() {
  const { data: session } = useSession()
  const { data: records, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  const userRecords =
    records?.filter((record) => record.userId === session?.user?.id) || []

  return (
    <PaymentRecordsTable
      title="User Records"
      description="Initial payment records for your stall"
      records={userRecords}
      showMonthFilter={false}
      isLoading={isLoading}
    />
  )
}

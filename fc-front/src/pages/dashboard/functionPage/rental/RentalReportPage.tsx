import { useSession } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'

import { PaymentRecordsTable } from '@/components/PaymentRecordsTable'
import { PageHeader } from '@/components/dashboard/PageHeader'

export function RentalReportPage() {
  const { data: session } = useSession()
  const { data: records, isLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  const userRecords =
    records?.filter((record) => record.userId === session?.user?.id) || []

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Rental Report"
        description="Rent, water and electricity charges for the stalls you hold."
      />
      <PaymentRecordsTable
        title="Records"
        records={userRecords}
        showMonthFilter={true}
        isLoading={isLoading}
      />
    </div>
  )
}

import { useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'

import AdminAppointmentTable from './components/AdminAppointmentTable'

export function AdminAppointmentPage() {
  const { data: session } = useSession()
  const { data } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: ['get-notifications', session?.user?.id],
  })
  const today = startOfDay(new Date())
  const current = (data ?? []).filter(
    (item) => startOfDay(new Date(item.appointmentDate)) >= today,
  )
  const waiting = current.filter(
    (item) => item.notificationRead === null,
  ).length

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Stall appointments">
        {data
          ? `${current.length} from today onward. ${waiting} pending.`
          : 'Requests to visit a stall before renting it.'}
      </PageHeader>
      <AdminAppointmentTable />
    </div>
  )
}

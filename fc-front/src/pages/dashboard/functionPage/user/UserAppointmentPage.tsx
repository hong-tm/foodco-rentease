import { PageHeader } from '@/components/dashboard/PageHeader'

import UserAppointmentTable from './components/UserAppointmentTable'

export function UserAppointmentPage() {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="User Appointment"
        description="Your stall-viewing appointments, their status, and any payment due."
      />
      <UserAppointmentTable />
    </div>
  )
}

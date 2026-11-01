import { useState } from 'react'

import { PageHeader } from '@/components/dashboard/PageHeader'

import AdminAppointmentTable from './components/AdminAppointmentTable'

export function AdminAppointmentPage() {
  const [selectedMonth, setSelectedMonth] = useState('all')

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Appointments"
        description="Stall appointment requests and the decision on each one"
      />
      <AdminAppointmentTable
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />
    </div>
  )
}

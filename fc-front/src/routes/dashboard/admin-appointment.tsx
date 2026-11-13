import { AdminAppointmentPage } from '@/pages/dashboard/functionPage/admin/AdminAppointmentPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin-appointment')({
  component: AdminAppointmentPage,
})

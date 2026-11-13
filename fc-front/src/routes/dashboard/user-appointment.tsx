import { UserAppointmentPage } from '@/pages/dashboard/functionPage/user/UserAppointmentPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/user-appointment')({
  component: UserAppointmentPage,
})

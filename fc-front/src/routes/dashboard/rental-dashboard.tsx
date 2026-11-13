import { RentalDashboard } from '@/pages/dashboard/functionPage/rental/RentalDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/rental-dashboard')({
  component: RentalDashboard,
})

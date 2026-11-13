import { RentalStallUtilitiesPage } from '@/pages/dashboard/functionPage/rental/RentalStallUtilitiesPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/stall-utilities')({
  component: RentalStallUtilitiesPage,
})

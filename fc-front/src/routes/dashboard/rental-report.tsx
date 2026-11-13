import { RentalReportPage } from '@/pages/dashboard/functionPage/rental/RentalReportPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/rental-report')({
  component: RentalReportPage,
})

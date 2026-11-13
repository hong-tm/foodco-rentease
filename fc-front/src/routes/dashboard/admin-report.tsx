import { AdminReportPage } from '@/pages/dashboard/functionPage/admin/AdminReportPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin-report')({
  component: AdminReportPage,
})

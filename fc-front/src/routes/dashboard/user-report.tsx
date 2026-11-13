import { UserReportPage } from '@/pages/dashboard/functionPage/user/UserReportPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/user-report')({
  component: UserReportPage,
})

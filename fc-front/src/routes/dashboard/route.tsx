import { DashboardLayoutPage } from '@/pages/dashboard/DashboardLayoutPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard')({
  component: DashboardLayoutPage,
})

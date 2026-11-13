import { AdminDashboard } from '@/pages/dashboard/functionPage/admin/AdminDashboard'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin-dashboard')({
  component: AdminDashboard,
})

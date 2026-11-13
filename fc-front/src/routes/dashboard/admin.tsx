import { AdminManage } from '@/pages/dashboard/functionPage/admin/AdminManage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/admin')({
  component: AdminManage,
})

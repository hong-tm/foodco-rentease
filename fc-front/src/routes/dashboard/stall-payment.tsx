import { AdminStallPayment } from '@/pages/dashboard/functionPage/admin/AdminStallPayment'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/stall-payment')({
  component: AdminStallPayment,
})

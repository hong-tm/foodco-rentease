import { PaymentSuccessPage } from '@/pages/dashboard/payment-success'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/payment-success')({
  component: PaymentSuccessPage,
})

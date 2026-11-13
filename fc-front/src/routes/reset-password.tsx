import ResetPasswordPage from '@/pages/(auth)/ResetPasswordPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/reset-password')({
  component: ResetPasswordPage,
})

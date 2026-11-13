import ChangePasswordPage from '@/pages/(auth)/ChangePasswordPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/change-password')({
  component: ChangePasswordPage,
})

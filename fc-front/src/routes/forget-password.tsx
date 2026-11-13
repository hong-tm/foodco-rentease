import ForgetPasswordPage from '@/pages/(auth)/ForgetPasswordPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/forget-password')({
  component: ForgetPasswordPage,
})

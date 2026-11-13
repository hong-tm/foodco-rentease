import { EmailVerifiedPage } from '@/pages/(auth)/EmailVerifiedPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/email-verified')({
  component: EmailVerifiedPage,
})

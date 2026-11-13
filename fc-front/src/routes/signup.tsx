import SignUpPage from '@/pages/(auth)/SignUpPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/signup')({
  component: SignUpPage,
})

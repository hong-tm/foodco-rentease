import UserProfilePage from '@/pages/(auth)/UserProfilePage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/account')({
  component: UserProfilePage,
})

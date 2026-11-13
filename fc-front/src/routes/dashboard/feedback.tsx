import { FeedbackDisplayPage } from '@/pages/feedback/FeedbackDisplayPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/feedback')({
  component: FeedbackDisplayPage,
})

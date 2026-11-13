import { StallAvailabilityPage } from '@/pages/dashboard/functionPage/admin/StallAvailabilityPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/stall-availability')({
  // The page falls back to 'free' for an unknown state.
  validateSearch: (search: Record<string, unknown>): { state?: string } =>
    typeof search.state === 'string' ? { state: search.state } : {},
  component: StallAvailabilityPage,
})

import { TenantInformationPage } from '@/pages/dashboard/functionPage/admin/TenantInformationPage'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/tenant-information')({
  // The page falls back to 'all' for an unknown view.
  validateSearch: (search: Record<string, unknown>): { view?: string } =>
    typeof search.view === 'string' ? { view: search.view } : {},
  component: TenantInformationPage,
})

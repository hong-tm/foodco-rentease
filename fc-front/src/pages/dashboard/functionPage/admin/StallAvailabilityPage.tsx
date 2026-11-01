import { PageHeader } from '@/components/dashboard/PageHeader'

import StallsTable from './components/StallsTable'

export function StallAvailabilityPage() {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Stall Availability"
        description="Which stalls are vacant right now. Open a stall to read its lease or update its details."
      />
      <StallsTable />
    </div>
  )
}

export default StallAvailabilityPage

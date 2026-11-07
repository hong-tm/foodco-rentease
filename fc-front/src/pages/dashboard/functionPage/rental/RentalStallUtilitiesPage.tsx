import { PageHeader } from '@/components/dashboard/PageHeader'

import StallUtilitiesDetails from './components/StallUtilitiesDetails'

export function RentalStallUtilitiesPage() {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Stall Utilities"
        description="What you owe for each stall, and the bills you still have to pay."
      />
      <StallUtilitiesDetails />
    </div>
  )
}

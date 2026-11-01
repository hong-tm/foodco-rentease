import { PageHeader } from '@/components/dashboard/PageHeader'

import RentalsTable from './components/RentalsTable'

export function TenantInformationPage() {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Tenant Information"
        description="Manage rental and send email to tenants"
      />
      <RentalsTable />
    </div>
  )
}

export default TenantInformationPage

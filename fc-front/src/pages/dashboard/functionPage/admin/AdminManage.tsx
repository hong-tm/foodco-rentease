import { PageHeader } from '@/components/dashboard/PageHeader'

import UsersTable from './components/UsersTable'

export function AdminManage() {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Users"
        description="Accounts, roles and access across the rental platform"
      />
      <UsersTable />
    </div>
  )
}

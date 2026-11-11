import { fetchUsersQueryOptions } from '@/api/adminApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'

import UsersTable from './components/UsersTable'

export function AdminManage() {
  const { data } = useQuery(fetchUsersQueryOptions)
  const users = data?.users ?? []
  const banned = users.filter((user) => user.banned).length

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Admin">
        {data
          ? `${users.length} accounts can sign in. ${banned} ${banned === 1 ? 'is' : 'are'} banned.`
          : 'Roles, bans and sign-in access for every account.'}
      </PageHeader>
      <UsersTable />
    </div>
  )
}

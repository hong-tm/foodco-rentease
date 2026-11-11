import { useState } from 'react'
import type { GetUsersResponse } from '@/api/adminApi'
import { fetchUsersQueryOptions } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'

import { formatDate } from '@/lib/format'

import { Badge } from '@/components/ui/badge'
import { PanelError, PanelRowsSkeleton } from '@/components/ui/panel'
import {
  CountTabs,
  PanelToolbar,
  SearchField,
  TablePager,
  TablePanel,
  usePager,
} from '@/components/ui/panel-parts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PersonAvatar } from '@/components/person-avatar'

import { AdminActionButton } from './AdminActionButton'

type View = 'all' | 'admin' | 'rental' | 'user' | 'banned'

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  rental: 'Tenant',
  user: 'Applicant',
}

export default function UsersTable() {
  const { data, error, isLoading, refetch } = useQuery<GetUsersResponse>(
    fetchUsersQueryOptions,
  )
  const [view, setView] = useState<View>('all')
  const [search, setSearch] = useState('')

  const users = data?.users ?? []
  const countRole = (role: string) =>
    users.filter((user) => user.role === role).length
  const query = search.trim().toLowerCase()
  const rows = users.filter((user) => {
    const inView =
      view === 'all' || (view === 'banned' ? user.banned : user.role === view)
    const inSearch =
      !query ||
      [user.name, user.email, user.phone].some((field) =>
        field?.toLowerCase().includes(query),
      )
    return inView && inSearch
  })
  const pager = usePager(rows, 20)

  return (
    <TablePanel>
      <PanelToolbar className="justify-between">
        <CountTabs
          label="Filter accounts"
          value={view}
          onChange={setView}
          tabs={[
            { value: 'all', label: 'All', count: users.length },
            { value: 'rental', label: 'Tenants', count: countRole('rental') },
            { value: 'user', label: 'Applicants', count: countRole('user') },
            { value: 'admin', label: 'Admins', count: countRole('admin') },
            {
              value: 'banned',
              label: 'Banned',
              count: users.filter((user) => user.banned).length,
            },
          ]}
        />
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search name, email or phone"
          label="Search accounts"
        />
      </PanelToolbar>
      {isLoading ? (
        <div className="p-4 md:p-5">
          <PanelRowsSkeleton rows={6} />
        </div>
      ) : null}
      {error ? (
        <div className="p-4 md:p-5">
          <PanelError what="accounts" onRetry={() => refetch()} />
        </div>
      ) : null}
      {data ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="max-md:hidden">Role</TableHead>
                <TableHead className="max-md:hidden">Phone</TableHead>
                <TableHead className="max-md:hidden">Status</TableHead>
                <TableHead className="max-md:hidden">Joined</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.rows.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="max-md:w-full max-md:max-w-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <PersonAvatar
                        id={user.id}
                        name={user.name}
                        image={user.image}
                      />
                      <div className="min-w-0">
                        <p className="type-body truncate font-medium">
                          {user.name}
                        </p>
                        <p className="type-meta text-muted-foreground truncate">
                          {user.email}
                        </p>
                        <div className="type-meta text-muted-foreground mt-1 flex flex-wrap items-center gap-1.5 md:hidden">
                          <span>
                            {(user.role && roleLabel[user.role]) || user.role}
                          </span>
                          {user.banned ? (
                            <Badge variant="negative">Banned</Badge>
                          ) : null}
                          {user.emailVerified ? null : (
                            <Badge variant="warning">Unverified</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-md:hidden">
                    {(user.role && roleLabel[user.role]) || user.role}
                  </TableCell>
                  <TableCell className="text-muted-foreground max-md:hidden">
                    {user.phone || '—'}
                  </TableCell>
                  <TableCell className="max-md:hidden">
                    <div className="flex items-center gap-1.5">
                      {user.banned ? (
                        <Badge variant="negative">Banned</Badge>
                      ) : (
                        <span className="type-body text-muted-foreground">
                          Active
                        </span>
                      )}
                      {user.emailVerified ? null : (
                        <Badge variant="warning">Unverified</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-md:hidden">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role === 'admin' ? null : (
                      <AdminActionButton
                        userId={user.id}
                        userRole={user.role}
                        userBanned={user.banned}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {pager.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="type-body text-muted-foreground py-8 text-center"
                  >
                    No account matches this filter.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePager pager={pager} noun="accounts" />
        </>
      ) : null}
    </TablePanel>
  )
}

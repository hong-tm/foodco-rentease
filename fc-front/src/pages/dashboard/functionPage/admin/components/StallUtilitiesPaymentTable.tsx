import { useState } from 'react'
import { fetchUsersQueryOptions } from '@/api/adminApi'
import type { GetUsersResponse } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { PaymentType } from '@/pages/dashboard/components/PaymentType'
import { useQuery } from '@tanstack/react-query'

import { formatDate, formatRM } from '@/lib/format'

import { Badge } from '@/components/ui/badge'
import { PanelError, PanelRowsSkeleton } from '@/components/ui/panel'
import {
  CountTabs,
  PanelToolbar,
  TablePager,
  TablePanel,
  usePager,
} from '@/components/ui/panel-parts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PersonAvatar } from '@/components/person-avatar'

import { TenantActionButton } from './TenantActionButton'

export default function StallUtilitiesPaymentTable() {
  const [status, setStatus] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const {
    data: payments,
    isLoading,
    error,
    refetch,
  } = useQuery(getAllPaymentRecordsQueryOptions)
  const { data: usersData } = useQuery<GetUsersResponse>(fetchUsersQueryOptions)

  const utilityPayments = (payments ?? []).filter(
    (payment) =>
      payment.paymentType === 'water' || payment.paymentType === 'electric',
  )
  const uniqueUsers = [
    ...new Set(utilityPayments.map((payment) => payment.userId)),
  ]
  const getUser = (userId: string) =>
    usersData?.users.find((user: { id: string }) => user.id === userId)
  const getUserName = (userId: string) => getUser(userId)?.name || userId

  const scoped = utilityPayments.filter(
    (payment) =>
      (selectedUser === 'all' || payment.userId === selectedUser) &&
      (selectedType === 'all' || payment.paymentType === selectedType),
  )
  const rows = scoped
    .filter(
      (payment) =>
        status === 'all' ||
        (status === 'unpaid' ? !payment.paymentStatus : payment.paymentStatus),
    )
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )
  const pager = usePager(rows, 15, `${status}|${selectedType}|${selectedUser}`)

  return (
    <TablePanel>
      <PanelToolbar>
        <CountTabs
          label="Filter by payment status"
          value={status}
          onChange={setStatus}
          tabs={[
            { value: 'all', label: 'All', count: scoped.length },
            {
              value: 'unpaid',
              label: 'Unpaid',
              count: scoped.filter((p) => !p.paymentStatus).length,
            },
            {
              value: 'paid',
              label: 'Paid',
              count: scoped.filter((p) => p.paymentStatus).length,
            },
          ]}
        />
        <div className="flex gap-2 max-md:w-full md:ml-auto">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger
              aria-label="Filter by type"
              className="w-32 max-md:h-11 max-md:flex-1"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger
              aria-label="Filter by tenant"
              className="w-48 max-md:h-11 max-md:flex-1"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tenants</SelectItem>
              {uniqueUsers.map((userId) => (
                <SelectItem key={userId} value={userId}>
                  {getUserName(userId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </PanelToolbar>
      {isLoading ? (
        <div className="p-4 md:p-5">
          <PanelRowsSkeleton rows={6} />
        </div>
      ) : null}
      {error ? (
        <div className="p-4 md:p-5">
          <PanelError what="utility bills" onRetry={() => refetch()} />
        </div>
      ) : null}
      {payments ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="max-md:hidden">Date</TableHead>
                <TableHead>Tenant</TableHead>
                <TableHead className="max-md:hidden">Stall</TableHead>
                <TableHead className="max-md:hidden">Type</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="max-md:hidden">Status</TableHead>
                <TableHead className="max-md:hidden">Payment ID</TableHead>
                <TableHead className="max-md:hidden">
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pager.rows.map((payment) => {
                const name = getUserName(payment.userId)
                const user = getUser(payment.userId)
                const kind =
                  payment.paymentType === 'water' ? 'water' : 'electricity'
                const amount = formatRM(Number(payment.paymentAmount))
                const date = formatDate(payment.paymentDate)
                // Admins cannot mark a bill paid (no API), so the action is a reminder email.
                const remind =
                  payment.paymentStatus || !user?.email ? null : (
                    <TenantActionButton
                      userName={name}
                      userEmail={user.email}
                      userStallId={payment.stallId}
                      userStallName=""
                      className="max-md:h-11"
                      email={{
                        subject: `Unpaid ${kind} bill for stall ${payment.stallId}`,
                        text: `Dear ${name},\n\nYour ${kind} bill for stall ${payment.stallId} is still unpaid.\n\nAmount: ${amount}\nBill date: ${date}\n\nPlease pay it in FoodCo RentEase.\n\nThank you!`,
                        description: `${name} gets an email about the unpaid ${kind} bill of ${amount} for stall ${payment.stallId}.`,
                      }}
                    />
                  )
                return (
                  <TableRow key={payment.paymentId}>
                    <TableCell className="text-muted-foreground whitespace-nowrap max-md:hidden">
                      {formatDate(payment.paymentDate)}
                    </TableCell>
                    <TableCell className="max-md:w-full max-md:max-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <PersonAvatar
                          id={payment.userId}
                          name={name}
                          image={getUser(payment.userId)?.image}
                          className="size-6"
                        />
                        <span className="truncate">{name}</span>
                      </div>
                      <p className="type-meta text-muted-foreground mt-1 truncate md:hidden">
                        {formatDate(payment.paymentDate)} · Stall{' '}
                        {payment.stallId} ·{' '}
                        {payment.paymentType === 'rental' ? (
                          'Rent'
                        ) : (
                          <PaymentType type={payment.paymentType} />
                        )}
                      </p>
                      {remind ? (
                        <div className="mt-2 md:hidden">{remind}</div>
                      ) : null}
                    </TableCell>
                    <TableCell className="tabular-nums max-md:hidden">
                      {payment.stallId}
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      <PaymentType type={payment.paymentType} />
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatRM(Number(payment.paymentAmount))}
                      {payment.paymentStatus ? null : (
                        <div className="mt-1 md:hidden">
                          <Badge variant="warning">Unpaid</Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-md:hidden">
                      {payment.paymentStatus ? (
                        <span className="text-muted-foreground">Paid</span>
                      ) : (
                        <Badge variant="warning">Unpaid</Badge>
                      )}
                    </TableCell>
                    <TableCell
                      className="type-id text-muted-foreground max-w-40 truncate max-md:hidden"
                      title={payment.paymentId}
                    >
                      {payment.paymentId}
                    </TableCell>
                    <TableCell className="text-right max-md:hidden">
                      {remind}
                    </TableCell>
                  </TableRow>
                )
              })}
              {pager.total === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="type-body text-muted-foreground py-8 text-center"
                  >
                    No bills match these filters.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
          <TablePager pager={pager} noun="bills" />
        </>
      ) : null}
    </TablePanel>
  )
}

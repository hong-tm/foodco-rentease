import { useState } from 'react'
import type { GetUsersResponse } from '@/api/adminApi'
import { fetchUsersQueryOptions } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

const DAY_MS = 24 * 60 * 60 * 1000

const labelClass =
  'text-muted-foreground text-xs font-medium tracking-widest uppercase'

// Seven columns split 12 / 22 / 10 / 11 / 13 / 11 / 21 across one ledger. Only
// the tenant column takes a scale step (w-1/5 is 20%, close but not equal, so
// every share stays explicit and page-scoped here).
const COLUMN_WIDTH = {
  stall: '12%',
  tenant: '22%',
  type: '10%',
  amount: '11%',
  status: '13%',
  date: '11%',
  reference: '21%',
} as const

function money(value?: string | number | null) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  if (amount === undefined || amount === null || !Number.isFinite(amount)) {
    return null
  }
  return amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function daysOpen(paymentDate: Date | string) {
  const days = Math.floor(
    (Date.now() - new Date(paymentDate).getTime()) / DAY_MS,
  )
  return Number.isFinite(days) && days >= 0 ? days : null
}

function typeLabel(type: string) {
  if (type === 'water') return 'Water'
  if (type === 'electric') return 'Electric'
  if (type === 'rental') return 'Rental'
  return type
}

export default function StallUtilitiesPaymentTable() {
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const {
    data: payments,
    isLoading,
    error,
    refetch,
  } = useQuery(getAllPaymentRecordsQueryOptions)
  const { data: usersData } = useQuery<GetUsersResponse>(fetchUsersQueryOptions)
  const { data: stallsData } = useQuery(fetchStallsQueryOptions)

  if (isLoading) {
    return (
      <section
        role="status"
        aria-live="polite"
        aria-label="Payment records"
        className="flex flex-col gap-4"
      >
        <span className="sr-only">Loading utility charges…</span>
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-9 w-64" />
        </div>
        <div className="border-border flex flex-col gap-4 rounded-xl border p-6">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="flex items-center gap-4">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-6 w-24" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section aria-label="Payment records" className="flex flex-col gap-4">
        <h2 className="text-sm font-medium">Payment records</h2>
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
        >
          <p>Utility charges could not be loaded: {error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </section>
    )
  }

  const userById = new Map(
    (usersData?.users ?? []).map((user) => [user.id, user]),
  )
  const stallById = new Map(
    (stallsData?.stall ?? []).map((stall) => [stall.stallNumber, stall]),
  )
  const userName = (userId: string) => userById.get(userId)?.name ?? userId

  const utilityPayments = (payments ?? []).filter(
    (payment) =>
      payment.paymentType === 'water' || payment.paymentType === 'electric',
  )

  const uniqueUsers = [...new Set(utilityPayments.map((p) => p.userId))]

  const visible = utilityPayments
    .filter((p) => selectedUser === 'all' || p.userId === selectedUser)
    .filter((p) => selectedType === 'all' || p.paymentType === selectedType)
    .sort(
      (a, b) =>
        new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime(),
    )

  return (
    <section
      aria-label="Payment records"
      className="flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={labelClass}>Payment records</h2>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-40" aria-label="Filter by utility type">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-52" aria-label="Filter by tenant">
              <SelectValue placeholder="Select tenant" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All tenants</SelectItem>
              {uniqueUsers.map((userId) => (
                <SelectItem key={userId} value={userId}>
                  {userName(userId)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="border-border flex flex-col items-start gap-3 rounded-xl border p-6 text-sm">
          <p className="text-muted-foreground">
            No charges match these filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedType('all')
              setSelectedUser('all')
            }}
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="max-w-full min-w-0 overflow-hidden">
          <Table className="xl:min-w-table">
            <TableCaption className="sr-only">
              Utility charges with stall, tenant, amount, status and issue date
            </TableCaption>
            <TableHeader>
              <TableRow className="border-border/80 bg-muted/35 hover:bg-transparent border-b">
                <TableHead className={`h-12 pl-6 ${labelClass}`}>
                  Stall
                </TableHead>
                <TableHead
                  className={`hidden h-12 xl:table-cell ${labelClass}`}
                  style={{ width: COLUMN_WIDTH.tenant }}
                >
                  <span className="flex items-center gap-2">
                    <span aria-hidden className="size-7" />
                    Tenant
                  </span>
                </TableHead>
                <TableHead
                  className={`hidden h-12 xl:table-cell ${labelClass}`}
                  style={{ width: COLUMN_WIDTH.type }}
                >
                  Type
                </TableHead>
                <TableHead
                  className={`hidden h-12 text-right xl:table-cell ${labelClass}`}
                  style={{ width: COLUMN_WIDTH.amount }}
                >
                  Amount
                </TableHead>
                <TableHead
                  className={`hidden h-12 xl:table-cell ${labelClass}`}
                  style={{ width: COLUMN_WIDTH.status }}
                >
                  Status
                </TableHead>
                <TableHead
                  className={`hidden h-12 xl:table-cell ${labelClass}`}
                  style={{ width: COLUMN_WIDTH.date }}
                >
                  Charged
                </TableHead>
                <TableHead
                  className={`hidden h-12 pr-6 xl:table-cell ${labelClass}`}
                  style={{ width: COLUMN_WIDTH.reference }}
                >
                  Reference
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((payment) => {
                const user = userById.get(payment.userId)
                const stall = stallById.get(payment.stallId)
                const open = daysOpen(payment.paymentDate)
                const status = (
                  <StatusBadge
                    label={payment.paymentStatus ? 'Paid' : 'Pending'}
                    tone={payment.paymentStatus ? 'settled' : 'action'}
                    meta={
                      !payment.paymentStatus && open !== null
                        ? `${open} d open`
                        : undefined
                    }
                  />
                )

                return (
                  <TableRow
                    key={payment.paymentId}
                    className="border-border/60 hover:bg-muted/30"
                  >
                    <TableCell className="py-4 pl-6 align-top whitespace-normal relative before:absolute before:inset-y-0 before:left-0 before:w-px before:bg-foreground before:opacity-0 group-hover/row:before:opacity-100">
                      <p className="text-sm leading-none font-medium tabular-nums">
                        Stall {payment.stallId}
                      </p>
                      <p className="text-muted-foreground mt-1.5 text-xs">
                        {stall?.stallName ?? 'Name not recorded'}
                      </p>
                      <div className="mt-2 flex flex-col gap-1 text-xs xl:hidden">
                        <span>{userName(payment.userId)}</span>
                        <span className="text-muted-foreground tabular-nums">
                          {typeLabel(payment.paymentType)} · RM{' '}
                          {money(payment.paymentAmount) ?? '—'} ·{' '}
                          {formatDay(payment.paymentDate)}
                        </span>
                        <span className="mt-1">{status}</span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden py-4 align-top whitespace-normal xl:table-cell">
                      <div className="flex items-center gap-2">
                        <InitialsAvatar
                          name={userName(payment.userId)}
                          image={user?.image}
                        />
                        <span className="text-sm leading-none">
                          {userName(payment.userId)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="hidden py-4 align-top xl:table-cell">
                      <span className="text-sm">
                        {typeLabel(payment.paymentType)}
                      </span>
                    </TableCell>

                    <TableCell className="hidden py-4 text-right align-top xl:table-cell">
                      <span className="text-sm font-medium tabular-nums">
                        RM {money(payment.paymentAmount) ?? '—'}
                      </span>
                    </TableCell>

                    <TableCell className="hidden py-4 align-top xl:table-cell">
                      {status}
                    </TableCell>

                    <TableCell className="hidden py-4 align-top xl:table-cell">
                      <span className="text-sm tabular-nums">
                        {formatDay(payment.paymentDate)}
                      </span>
                    </TableCell>

                    <TableCell className="hidden py-4 pr-6 align-top xl:table-cell">
                      <span
                        className="text-muted-foreground text-xs tabular-nums"
                        title={payment.paymentId}
                      >
                        {payment.paymentId}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

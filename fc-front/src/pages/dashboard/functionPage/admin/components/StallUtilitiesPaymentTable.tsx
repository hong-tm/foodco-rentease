import { Fragment, useState } from 'react'
import type { ReactNode } from 'react'
import type { GetUsersResponse } from '@/api/adminApi'
import { fetchUsersQueryOptions } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import {
  CalendarDaysIcon,
  ChevronRightIcon,
  DropletsIcon,
  FileTextIcon,
  StoreIcon,
  UserIcon,
  WalletIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react'

import { formatDay } from '@/lib/format'
import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
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
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS
const HISTORY_LIMIT = 5

// Six columns split 14 / 20 / 20 / 12 / 26 / 8 across one ledger: Type
// carries its reference ID and Charged carries the status as second lines
// (double-row cells), so the ledger keeps every datum without the 8-column
// squeeze. The last 8% carries the expand affordance at the row end.
const COLUMN_WIDTH = {
  stall: '14%',
  tenant: '20%',
  typeRef: '20%',
  amount: '12%',
  charged: '26%',
  expand: '8%',
} as const

// Data keeps its colour: each utility type carries the same series token the
// charts use, so a bar or icon here reads as the same quantity elsewhere.
const TYPE_TONE: Record<
  string,
  { bar: string; ink: string; icon: LucideIcon }
> = {
  water: { bar: 'bg-series-2', ink: 'text-series-2', icon: DropletsIcon },
  electric: { bar: 'bg-series-1', ink: 'text-series-1', icon: ZapIcon },
}

const FALLBACK_TONE = {
  bar: 'bg-muted-foreground',
  ink: 'text-muted-foreground',
  icon: FileTextIcon,
}

type Period = 'week' | 'month' | 'earlier'

const PERIODS: { key: Period; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'earlier', label: 'Earlier' },
]

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

function periodOf(paymentDate: Date | string): Period {
  const date = new Date(paymentDate)
  if (Date.now() - date.getTime() < WEEK_MS) return 'week'
  const now = new Date()
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  ) {
    return 'month'
  }
  return 'earlier'
}

function typeLabel(type: string) {
  if (type === 'water') return 'Water'
  if (type === 'electric') return 'Electric'
  if (type === 'rental') return 'Rental'
  return type
}

function HeadIcon({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <Icon
      aria-hidden
      strokeWidth={1.75}
      className="text-muted-foreground size-3.5 shrink-0"
    />
  )
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="type-label text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  )
}

export default function StallUtilitiesPaymentTable() {
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)
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

  const groups = PERIODS.map((period) => ({
    ...period,
    rows: visible.filter(
      (payment) => periodOf(payment.paymentDate) === period.key,
    ),
  })).filter((group) => group.rows.length > 0)

  const expandedPayment = expandedId
    ? visible.find((payment) => payment.paymentId === expandedId)
    : undefined

  // The panel answers "what else has this stall been charged", so it reads the
  // unfiltered set: a tenant filter must not hide the stall's own history.
  const stallHistory = expandedPayment
    ? utilityPayments
        .filter((payment) => payment.stallId === expandedPayment.stallId)
        .sort(
          (a, b) =>
            new Date(b.paymentDate).getTime() -
            new Date(a.paymentDate).getTime(),
        )
    : []
  const settledHistory = stallHistory.filter(
    (payment) => payment.paymentStatus,
  ).length

  const typeValue = selectedType === 'all' ? 'All' : typeLabel(selectedType)
  const tenantValue = selectedUser === 'all' ? 'All' : userName(selectedUser)

  return (
    <section
      aria-label="Payment records"
      className="flex min-w-0 flex-col gap-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="type-section-title">Payment records</h2>

        <div className="flex flex-wrap gap-2">
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-44" aria-label="Filter by utility type">
              <span className="flex items-baseline gap-1.5 text-sm">
                <span className="text-muted-foreground">Type:</span>
                <span
                  className={cn(
                    selectedType === 'all'
                      ? 'text-muted-foreground'
                      : 'text-foreground font-medium',
                  )}
                >
                  {typeValue}
                </span>
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="water">Water</SelectItem>
              <SelectItem value="electric">Electric</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-56" aria-label="Filter by tenant">
              <span className="flex items-baseline gap-1.5 text-sm">
                <span className="text-muted-foreground">Tenant:</span>
                <span
                  className={cn(
                    selectedUser === 'all'
                      ? 'text-muted-foreground'
                      : 'text-foreground font-medium',
                  )}
                >
                  {tenantValue}
                </span>
              </span>
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
        <div className="border-border max-w-full min-w-0 overflow-hidden rounded-xl border">
          <Table className="xl:min-w-table">
            <TableCaption className="sr-only">
              Utility charges with stall, tenant, amount, status and issue date.
              Each row expands to that stall's water and electric history.
            </TableCaption>
            <TableHeader>
              <TableRow className="border-border border-b hover:bg-transparent">
                <TableHead
                  className={`type-label text-muted-foreground h-12 pl-6`}
                  style={{ width: COLUMN_WIDTH.stall }}
                >
                  <span className="flex items-center gap-2">
                    <HeadIcon icon={StoreIcon} />
                    Stall
                  </span>
                </TableHead>
                <TableHead
                  className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                  style={{ width: COLUMN_WIDTH.tenant }}
                >
                  <span className="flex items-center gap-2">
                    <HeadIcon icon={UserIcon} />
                    Tenant
                  </span>
                </TableHead>
                <TableHead
                  className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                  style={{ width: COLUMN_WIDTH.typeRef }}
                >
                  <span className="flex items-center gap-2">
                    <HeadIcon icon={DropletsIcon} />
                    Type
                  </span>
                </TableHead>
                <TableHead
                  className={`type-label text-muted-foreground hidden h-12 text-right xl:table-cell`}
                  style={{ width: COLUMN_WIDTH.amount }}
                >
                  <span className="flex items-center justify-end gap-2">
                    <HeadIcon icon={WalletIcon} />
                    Amount
                  </span>
                </TableHead>
                <TableHead
                  className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                  style={{ width: COLUMN_WIDTH.charged }}
                >
                  <span className="flex items-center gap-2">
                    <HeadIcon icon={CalendarDaysIcon} />
                    Charged
                  </span>
                </TableHead>
                <TableHead
                  className="h-12 pr-6"
                  style={{ width: COLUMN_WIDTH.expand }}
                >
                  <span className="sr-only">Expand row</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <Fragment key={group.key}>
                  <TableRow className="border-border bg-muted/40 hover:bg-muted/40">
                    <TableCell colSpan={6} className="px-6 py-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="type-label text-muted-foreground uppercase">
                          {group.label}
                        </span>
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {group.rows.length}{' '}
                          {group.rows.length === 1 ? 'charge' : 'charges'}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>

                  {group.rows.map((payment) => {
                    const user = userById.get(payment.userId)
                    const stall = stallById.get(payment.stallId)
                    const open = daysOpen(payment.paymentDate)
                    const paid = payment.paymentStatus
                    const isOpen = expandedId === payment.paymentId
                    const tone = TYPE_TONE[payment.paymentType] ?? FALLBACK_TONE
                    const TypeIcon = tone.icon
                    const panelId = `utilities-panel-${payment.paymentId}`
                    const status = paid ? (
                      // Settled rows lose the pill fill so pending charges
                      // stay the only coloured marks in the queue.
                      <Badge
                        variant="outline"
                        className="text-muted-foreground font-medium"
                      >
                        Paid
                      </Badge>
                    ) : (
                      <StatusBadge
                        label="Pending"
                        tone="action"
                        meta={open !== null ? `${open} d open` : undefined}
                      />
                    )

                    return (
                      <Fragment key={payment.paymentId}>
                        <TableRow
                          onClick={() =>
                            setExpandedId(isOpen ? null : payment.paymentId)
                          }
                          className={cn(
                            'group/row border-border hover:bg-muted/30 cursor-pointer',
                            paid && 'bg-muted/20 text-muted-foreground',
                            isOpen && 'bg-muted/40',
                          )}
                        >
                          <TableCell className="before:bg-foreground relative py-4 pl-6 align-baseline whitespace-normal before:absolute before:inset-y-0 before:left-0 before:w-px before:opacity-0 group-hover/row:before:opacity-100">
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

                          <TableCell className="hidden py-4 align-baseline whitespace-normal xl:table-cell">
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

                          <TableCell className="hidden py-4 align-baseline xl:table-cell">
                            <div className="flex min-w-0 flex-col gap-1">
                              <span
                                className={cn(
                                  'flex items-center gap-1.5 text-sm',
                                  paid ? 'text-muted-foreground' : tone.ink,
                                )}
                              >
                                <TypeIcon
                                  aria-hidden
                                  className="size-3.5 shrink-0"
                                />
                                {typeLabel(payment.paymentType)}
                              </span>
                              <span
                                className="text-muted-foreground font-mono text-xs"
                                title={payment.paymentId}
                              >
                                {payment.paymentId.slice(0, 8)}…
                              </span>
                            </div>
                          </TableCell>

                          <TableCell className="hidden py-4 text-right align-baseline xl:table-cell">
                            <span className="text-sm font-medium tabular-nums">
                              RM {money(payment.paymentAmount) ?? '—'}
                            </span>
                          </TableCell>

                          <TableCell className="hidden py-4 align-baseline xl:table-cell">
                            <div className="flex min-w-0 flex-col gap-1.5">
                              <span className="text-sm tabular-nums">
                                {formatDay(payment.paymentDate)}
                              </span>
                              {status}
                            </div>
                          </TableCell>

                          <TableCell className="py-2 pr-6 text-right align-baseline">
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-expanded={isOpen}
                              aria-controls={isOpen ? panelId : undefined}
                              aria-label={`${isOpen ? 'Hide' : 'Show'} utility history for stall ${payment.stallId}`}
                              onClick={(event) => {
                                event.stopPropagation()
                                setExpandedId(isOpen ? null : payment.paymentId)
                              }}
                              className="text-muted-foreground ml-auto"
                            >
                              <ChevronRightIcon
                                aria-hidden
                                className={cn(
                                  'size-4 transition-transform',
                                  isOpen && 'rotate-90',
                                )}
                              />
                            </Button>
                          </TableCell>
                        </TableRow>

                        {isOpen ? (
                          <TableRow
                            id={panelId}
                            className="border-border bg-muted/30 hover:bg-muted/30"
                          >
                            <TableCell colSpan={6} className="p-0">
                              <div className="flex gap-4 px-6 py-5">
                                <span
                                  aria-hidden
                                  className={cn(
                                    'w-1 shrink-0 rounded-full',
                                    tone.bar,
                                  )}
                                />
                                <div className="flex min-w-0 flex-1 flex-col gap-5">
                                  <dl className="grid gap-x-8 gap-y-3 sm:grid-cols-2 xl:grid-cols-4">
                                    <Detail label="Tenant">
                                      {userName(payment.userId)}
                                    </Detail>
                                    <Detail label="Type">
                                      <span
                                        className={cn(
                                          'flex items-center gap-1.5',
                                          tone.ink,
                                        )}
                                      >
                                        <TypeIcon
                                          aria-hidden
                                          className="size-3.5 shrink-0"
                                        />
                                        {typeLabel(payment.paymentType)}
                                      </span>
                                    </Detail>
                                    <Detail label="Charged">
                                      <span className="tabular-nums">
                                        {formatDay(payment.paymentDate)}
                                      </span>
                                    </Detail>
                                    <Detail label="Amount">
                                      <span className="font-medium tabular-nums">
                                        RM {money(payment.paymentAmount) ?? '—'}
                                      </span>
                                    </Detail>
                                    <Detail label="Reference">
                                      <span
                                        className="font-mono text-xs break-all"
                                        title={payment.paymentId}
                                      >
                                        {payment.paymentId}
                                      </span>
                                    </Detail>
                                    <Detail label="Stall">
                                      {stall?.stallName ?? 'Name not recorded'}
                                    </Detail>
                                  </dl>

                                  <div className="flex flex-col gap-2">
                                    <div className="flex items-baseline justify-between gap-3">
                                      <span className="type-label text-muted-foreground uppercase">
                                        Stall {payment.stallId} utilities
                                      </span>
                                      <span className="text-muted-foreground text-xs tabular-nums">
                                        {settledHistory} of{' '}
                                        {stallHistory.length} settled
                                      </span>
                                    </div>
                                    <ul className="divide-border border-border divide-y rounded-lg border">
                                      {stallHistory
                                        .slice(0, HISTORY_LIMIT)
                                        .map((entry) => {
                                          const entryTone =
                                            TYPE_TONE[entry.paymentType] ??
                                            FALLBACK_TONE
                                          const EntryIcon = entryTone.icon
                                          return (
                                            <li
                                              key={entry.paymentId}
                                              className="flex items-center gap-3 px-3 py-2"
                                            >
                                              <EntryIcon
                                                aria-hidden
                                                className={cn(
                                                  'size-3.5 shrink-0',
                                                  entryTone.ink,
                                                )}
                                              />
                                              <span className="text-muted-foreground w-20 shrink-0 text-xs tabular-nums">
                                                {formatDay(entry.paymentDate)}
                                              </span>
                                              <span className="min-w-0 flex-1 truncate text-sm">
                                                {typeLabel(entry.paymentType)}
                                              </span>
                                              <span className="text-sm tabular-nums">
                                                RM{' '}
                                                {money(entry.paymentAmount) ??
                                                  '—'}
                                              </span>
                                              <span
                                                className={cn(
                                                  'type-label flex items-center gap-1.5',
                                                  entry.paymentStatus
                                                    ? 'text-muted-foreground'
                                                    : 'text-brand-ink',
                                                )}
                                              >
                                                <span
                                                  aria-hidden
                                                  className={cn(
                                                    'size-1.5 rounded-full',
                                                    entry.paymentStatus
                                                      ? 'bg-success-ink'
                                                      : 'bg-brand',
                                                  )}
                                                />
                                                {entry.paymentStatus
                                                  ? 'Paid'
                                                  : 'Pending'}
                                              </span>
                                            </li>
                                          )
                                        })}
                                    </ul>
                                    {stallHistory.length > HISTORY_LIMIT ? (
                                      <p className="text-muted-foreground text-xs">
                                        +{stallHistory.length - HISTORY_LIMIT}{' '}
                                        older charges on record
                                      </p>
                                    ) : null}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </Fragment>
                    )
                  })}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

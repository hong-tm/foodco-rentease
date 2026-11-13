import { Fragment, useState, type ReactNode } from 'react'
import { fetchUsersQueryOptions, useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { useQuery } from '@tanstack/react-query'
import { differenceInCalendarDays, startOfDay } from 'date-fns'
import {
  CalendarDaysIcon,
  ChevronDownIcon,
  FileTextIcon,
  StoreIcon,
  UserIcon,
  WalletIcon,
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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import { StatusBadge } from '@/components/dashboard/StatusBadge'

import AdminAppointmentActionButton from './AdminAppointmentActionButton'

// First column absorbs slack; 26/12/12/10 keep the request text readable and the
// decision control at its own width.
// The booking form writes this sentence itself; it says nothing the stall
// number does not. A message anyone typed by hand stays visible.
const GENERATED_REQUEST = /^I want to make (an )?appointment for stall \d+\.?$/i

const COLUMN_WIDTH = {
  request: '26%',
  requested: '12%',
  status: '12%',
  decision: '10%',
} as const

const MONTHS = [
  { value: 'all', label: 'All months' },
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
]

type FilterKey = 'pending' | 'upcoming' | 'decided'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'decided', label: 'Decided' },
]

const GROUPS = [
  { key: 'today', label: 'TODAY' },
  { key: 'tomorrow', label: 'TOMORROW' },
  { key: 'week', label: 'THIS WEEK' },
  { key: 'later', label: 'LATER' },
] as const

type GroupKey = (typeof GROUPS)[number]['key']

const SETTLED_INK: Record<string, string> = {
  Approved: 'text-success-ink',
  Rejected: 'text-destructive-ink',
}

const COLUMN_COUNT = 5

type AdminAppointmentTableProps = {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

function statusOf(read: boolean | null) {
  if (read === null) return 'Pending'
  return read ? 'Approved' : 'Rejected'
}

function groupOf(date: Date | string): GroupKey {
  const days = differenceInCalendarDays(new Date(date), new Date())
  if (days <= 0) return 'today'
  if (days === 1) return 'tomorrow'
  if (days <= 7) return 'week'
  return 'later'
}

function decisionLabel(read: boolean | null) {
  if (read === null) return 'Awaiting decision'
  return read ? 'Approved' : 'Rejected'
}

// The request carries no payment record of its own, so the panel states what
// the decision makes due instead of inventing an amount.
function paymentLabel(read: boolean | null) {
  if (read === null) return 'Due on approval'
  return read ? 'Due now' : 'Not applicable'
}

function toneBarOf(read: boolean | null) {
  if (read === null) return 'bg-primary'
  return read ? 'bg-success-ink' : 'bg-destructive'
}

function StatusPill({ status, settled }: { status: string; settled: boolean }) {
  if (!settled) return <StatusBadge label={status} tone="action" />

  return (
    <Badge
      variant="outline"
      className={cn('border-border font-medium', SETTLED_INK[status])}
    >
      {status}
    </Badge>
  )
}

function Detail({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="type-label text-muted-foreground">{label}</dt>
      <dd className="text-sm break-words">{value}</dd>
    </div>
  )
}

function HeaderLabel({
  icon: Icon,
  children,
}: {
  icon: typeof UserIcon
  children: ReactNode
}) {
  return (
    <span className="flex items-center gap-2">
      <Icon aria-hidden="true" className="size-3.5 shrink-0" />
      {children}
    </span>
  )
}

export default function AdminAppointmentTable({
  selectedMonth,
  onMonthChange,
}: AdminAppointmentTableProps) {
  const { data: session } = useSession()
  const { data: users } = useQuery(fetchUsersQueryOptions)
  const {
    data: notifications,
    error,
    isLoading,
    refetch,
  } = useQuery({
    ...getAllNotificationQueryOptions,
    queryKey: ['get-notifications', session?.user?.id],
  })

  const [filter, setFilter] = useState<FilterKey>('upcoming')
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const monthLabel =
    MONTHS.find((month) => month.value === selectedMonth)?.label ?? 'All months'

  const today = startOfDay(new Date())
  const upcoming = (notifications ?? [])
    .filter((notification) => {
      const appointmentDate = startOfDay(new Date(notification.appointmentDate))
      const isCurrentOrFuture = appointmentDate >= today
      const isSelectedMonth =
        selectedMonth === 'all' ||
        appointmentDate.getMonth().toString() === selectedMonth
      return isCurrentOrFuture && isSelectedMonth
    })
    .sort(
      (a, b) =>
        new Date(a.appointmentDate).getTime() -
        new Date(b.appointmentDate).getTime(),
    )

  const pending = upcoming.filter(
    (notification) => notification.notificationRead === null,
  )
  const decided = upcoming.filter(
    (notification) => notification.notificationRead !== null,
  )

  const counts: Record<FilterKey, number> = {
    pending: pending.length,
    upcoming: upcoming.length,
    decided: decided.length,
  }

  const rows =
    filter === 'pending' ? pending : filter === 'decided' ? decided : upcoming

  const sections = GROUPS.map((group) => ({
    ...group,
    rows: rows.filter(
      (notification) => groupOf(notification.appointmentDate) === group.key,
    ),
  })).filter((section) => section.rows.length > 0)

  const toggleExpanded = (notificationId: number) =>
    setExpandedId((current) =>
      current === notificationId ? null : notificationId,
    )

  const emptyCopy =
    filter === 'pending'
      ? 'No pending requests.'
      : filter === 'decided'
        ? 'No requests decided yet.'
        : selectedMonth === 'all'
          ? 'No upcoming appointments.'
          : `No upcoming appointments in ${monthLabel}.`

  const toolbar = (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(next) => {
          if (next) setFilter(next as FilterKey)
        }}
        aria-label="Filter appointments by state"
        className="bg-muted/40 border-border flex-wrap gap-1 rounded-lg border p-1"
      >
        {FILTERS.map((item) => (
          <ToggleGroupItem
            key={item.key}
            value={item.key}
            aria-label={`${item.label} (${counts[item.key]})`}
            className="text-muted-foreground data-[state=on]:border-primary data-[state=on]:bg-card data-[state=on]:text-foreground hover:bg-card/60 hover:text-foreground flex-none rounded-md border-t-2 border-transparent px-3"
          >
            <span className="text-sm">{item.label}</span>
            <span className="text-sm font-medium tabular-nums">
              {counts[item.key]}
            </span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select value={selectedMonth} onValueChange={onMonthChange}>
        <SelectTrigger className="w-48" aria-label="Filter by month">
          <span className="flex min-w-0 items-baseline gap-1.5">
            <span className="text-muted-foreground">Month:</span>
            <span
              className={cn(
                'truncate',
                selectedMonth === 'all'
                  ? 'text-muted-foreground'
                  : 'text-foreground font-medium',
              )}
            >
              {selectedMonth === 'all' ? 'All' : monthLabel}
            </span>
          </span>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">{MONTHS[0].label}</SelectItem>
          {MONTHS.slice(1).map((month) => (
            <SelectItem key={month.value} value={month.value}>
              {month.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <div
          role="status"
          aria-live="polite"
          className="border-border flex flex-col gap-5 rounded-xl border p-6"
        >
          <span className="sr-only">Loading appointments…</span>
          {[0, 1, 2].map((row) => (
            <div
              key={row}
              className="flex items-center gap-3"
              aria-hidden="true"
            >
              <Skeleton className="size-9 rounded-full" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        role="alert"
        className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
      >
        <p>Appointments could not be loaded: {error.message}</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    )
  }

  if (upcoming.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <p className="text-muted-foreground text-sm">{emptyCopy}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {toolbar}
      <div className="border-border max-w-full overflow-hidden rounded-xl border">
        <Table className="xl:min-w-table">
          <TableCaption className="sr-only">
            Upcoming appointment requests with decision status and action
          </TableCaption>
          <TableHeader className="max-xl:sr-only">
            <TableRow className="border-border border-b hover:bg-transparent">
              <TableHead
                className={`type-label text-muted-foreground h-12 w-2/5 pl-6`}
              >
                <HeaderLabel icon={UserIcon}>Requester</HeaderLabel>
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.request }}
              >
                <HeaderLabel icon={StoreIcon}>Request</HeaderLabel>
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.requested }}
              >
                <HeaderLabel icon={CalendarDaysIcon}>Requested</HeaderLabel>
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.status }}
              >
                <HeaderLabel icon={FileTextIcon}>Status</HeaderLabel>
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 pr-6 text-right xl:table-cell`}
                style={{ width: COLUMN_WIDTH.decision }}
              >
                <span className="flex items-center justify-end gap-2">
                  <WalletIcon
                    aria-hidden="true"
                    className="size-3.5 shrink-0"
                  />
                  Decision
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.length === 0 ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell
                  colSpan={COLUMN_COUNT}
                  className="text-muted-foreground py-6 pl-6 text-sm"
                >
                  {emptyCopy}
                </TableCell>
              </TableRow>
            ) : null}
            {sections.map((section) => (
              <Fragment key={section.key}>
                <TableRow className="bg-muted/40 border-border hover:bg-muted/40">
                  <TableCell
                    colSpan={COLUMN_COUNT}
                    className="type-label text-muted-foreground py-1.5 pr-6 pl-6"
                  >
                    <span className="flex items-center justify-between gap-4">
                      <span>{section.label}</span>
                      <span className="tabular-nums">
                        {section.rows.length}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
                {section.rows.map((notification) => {
                  const user = users?.users.find(
                    (candidate) => candidate.id === notification.userId,
                  )
                  const status = statusOf(notification.notificationRead)
                  const settled = notification.notificationRead !== null
                  const isExpanded = expandedId === notification.notificationId
                  const panelId = `appointment-detail-${notification.notificationId}`
                  const otherUpcoming = upcoming.filter(
                    (candidate) =>
                      candidate.userId === notification.userId &&
                      candidate.notificationId !== notification.notificationId,
                  )

                  const expander = (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground size-8 shrink-0"
                      aria-expanded={isExpanded}
                      aria-controls={panelId}
                      aria-label={`${
                        isExpanded ? 'Hide' : 'Show'
                      } details for ${user?.name ?? 'this request'}`}
                      onClick={(event) => {
                        event.stopPropagation()
                        toggleExpanded(notification.notificationId)
                      }}
                    >
                      <ChevronDownIcon
                        aria-hidden="true"
                        className={cn(
                          'size-4 transition-transform',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </Button>
                  )

                  return (
                    <Fragment key={notification.notificationId}>
                      <TableRow
                        onClick={() =>
                          toggleExpanded(notification.notificationId)
                        }
                        className={cn(
                          'group/row border-border cursor-pointer',
                          settled
                            ? 'bg-muted/20 hover:bg-muted/30'
                            : 'hover:bg-muted/20',
                        )}
                      >
                        <TableCell className="before:bg-foreground relative py-5 pl-6 align-baseline whitespace-normal before:absolute before:inset-y-0 before:left-0 before:w-px before:opacity-0 group-hover/row:before:opacity-100">
                          <div className="flex items-baseline gap-3">
                            <InitialsAvatar
                              name={user?.name ?? 'Unknown account'}
                              image={user?.image}
                            />
                            <div className="flex min-w-0 flex-1 flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-6">
                              <div className="flex min-w-0 flex-col gap-1">
                                <p
                                  className={cn(
                                    'text-sm leading-none font-medium',
                                    settled && 'text-muted-foreground',
                                  )}
                                >
                                  {user?.name ?? 'Unknown account'}
                                </p>
                                <p className="text-muted-foreground text-xs">
                                  {user?.email ?? 'No email on file'}
                                </p>
                                <p className="text-muted-foreground mt-1 text-xs xl:hidden">
                                  {GENERATED_REQUEST.test(
                                    notification.notificationMessage,
                                  )
                                    ? `Stall ${notification.notificationMessage.match(/stall (\d+)/i)?.[1]}`
                                    : notification.notificationMessage}
                                </p>
                                <p className="mt-1 flex flex-wrap items-center gap-2 text-xs xl:hidden">
                                  <span className="text-muted-foreground tabular-nums">
                                    {formatDay(notification.appointmentDate)}
                                  </span>
                                  <StatusPill
                                    status={status}
                                    settled={settled}
                                  />
                                </p>
                              </div>
                              <div
                                className="mt-2 flex shrink-0 items-center gap-2 md:mt-0 xl:hidden"
                                onClick={(event) => event.stopPropagation()}
                              >
                                <AdminAppointmentActionButton
                                  appointmentId={notification.notificationId}
                                  appointmentStatus={
                                    notification.notificationRead
                                  }
                                  stallNumber={notification.stallNumber}
                                />
                                {expander}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell
                          className="hidden py-5 align-baseline whitespace-normal xl:table-cell"
                          style={{ width: COLUMN_WIDTH.request }}
                        >
                          <span className="flex flex-col gap-1">
                            <span
                              className={cn(
                                'text-sm font-medium',
                                settled && 'text-muted-foreground',
                              )}
                            >
                              {notification.notificationMessage.match(
                                /stall (\d+)/i,
                              )
                                ? `Stall ${notification.notificationMessage.match(/stall (\d+)/i)?.[1]}`
                                : 'Appointment'}
                            </span>
                            {GENERATED_REQUEST.test(
                              notification.notificationMessage,
                            ) ? null : (
                              <span className="text-muted-foreground text-xs">
                                {notification.notificationMessage}
                              </span>
                            )}
                          </span>
                        </TableCell>
                        <TableCell
                          className="hidden py-5 align-baseline xl:table-cell"
                          style={{ width: COLUMN_WIDTH.requested }}
                        >
                          <span className="text-sm tabular-nums">
                            {formatDay(notification.appointmentDate)}
                          </span>
                        </TableCell>
                        <TableCell
                          className="hidden py-5 align-baseline xl:table-cell"
                          style={{ width: COLUMN_WIDTH.status }}
                        >
                          <StatusPill status={status} settled={settled} />
                        </TableCell>
                        <TableCell className="hidden py-5 pr-6 align-baseline xl:table-cell">
                          <div
                            className="flex items-center justify-end gap-2"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {expander}
                            <AdminAppointmentActionButton
                              appointmentId={notification.notificationId}
                              appointmentStatus={notification.notificationRead}
                              stallNumber={notification.stallNumber}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded ? (
                        <TableRow
                          id={panelId}
                          className="bg-muted/30 border-border hover:bg-muted/30"
                        >
                          <TableCell
                            colSpan={COLUMN_COUNT}
                            className="px-6 py-4"
                          >
                            <div className="flex gap-4">
                              <span
                                aria-hidden="true"
                                className={cn(
                                  'w-1 shrink-0 rounded-full',
                                  toneBarOf(notification.notificationRead),
                                )}
                              />
                              <dl className="grid min-w-0 flex-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                                <Detail
                                  label="Stall"
                                  value={notification.stallNumber}
                                />
                                <Detail
                                  label="Requested"
                                  value={formatDay(
                                    notification.appointmentDate,
                                  )}
                                />
                                <Detail
                                  label="Decision"
                                  value={decisionLabel(
                                    notification.notificationRead,
                                  )}
                                />
                                <Detail
                                  label="Payment"
                                  value={paymentLabel(
                                    notification.notificationRead,
                                  )}
                                />
                                <div className="flex min-w-0 flex-col gap-1 sm:col-span-2">
                                  <dt className="type-label text-muted-foreground">
                                    Other upcoming requests
                                  </dt>
                                  <dd>
                                    {otherUpcoming.length === 0 ? (
                                      <span className="text-muted-foreground text-sm">
                                        None from this requester.
                                      </span>
                                    ) : (
                                      <ul className="flex flex-col gap-1">
                                        {otherUpcoming.map((other) => (
                                          <li
                                            key={other.notificationId}
                                            className="flex flex-wrap items-baseline gap-x-3 text-sm"
                                          >
                                            <span className="tabular-nums">
                                              {formatDay(other.appointmentDate)}
                                            </span>
                                            <span className="text-muted-foreground">
                                              Stall {other.stallNumber}
                                            </span>
                                            <span className="text-muted-foreground text-xs">
                                              {statusOf(other.notificationRead)}
                                            </span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </dd>
                                </div>
                              </dl>
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
    </div>
  )
}

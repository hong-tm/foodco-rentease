import { fetchUsersQueryOptions } from '@/api/adminApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import type { AppPath } from '@/pages/dashboard/components/nav-data'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import {
  addMonths,
  format,
  isSameMonth,
  startOfMonth,
  subMonths,
} from 'date-fns'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Panel, PanelError } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'

import { ColumnChart } from './ColumnChart'

function Trend({
  title,
  total,
  note,
  link,
  to,
  series,
  color,
}: {
  title: string
  total: number
  note: string
  link: string
  to: AppPath
  series: { label: string; value: number }[]
  color: string
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2 p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="type-section">{title}</h2>
        <Button variant="quiet" asChild>
          <Link to={to}>{link}</Link>
        </Button>
      </div>
      <div>
        <p className="type-figure">{total}</p>
        <p className="type-meta text-muted-foreground">{note}</p>
      </div>
      <ColumnChart
        bare
        data={series}
        series={[{ key: 'value', label: title, color }]}
        height={88}
        ticks={[0, Math.max(1, ...series.map((point) => point.value))]}
      />
    </div>
  )
}

/** Small counts: a figure with six small columns says it, axes would not add. */
export default function GrowthPanel({ className }: { className?: string }) {
  const stalls = useQuery(fetchStallsQueryOptions)
  const users = useQuery(fetchUsersQueryOptions)
  const now = new Date()

  const startMonths = Array.from({ length: 6 }, (_, i) =>
    startOfMonth(addMonths(now, i - 3)),
  )
  const starts = startMonths.map((month) => ({
    label: format(month, 'MMM'),
    value: (stalls.data?.stall ?? []).filter(
      (stall) => stall.startAt && isSameMonth(new Date(stall.startAt), month),
    ).length,
  }))
  const signupMonths = Array.from({ length: 6 }, (_, i) =>
    startOfMonth(subMonths(now, 5 - i)),
  )
  const signups = signupMonths.map((month) => ({
    label: format(month, 'MMM'),
    value: (users.data?.users ?? []).filter((user) =>
      isSameMonth(new Date(user.createdAt), month),
    ).length,
  }))
  const totalOf = (points: { value: number }[]) =>
    points.reduce((sum, point) => sum + point.value, 0)

  if (stalls.isLoading || users.isLoading) {
    return (
      <Panel className={className}>
        <Skeleton className="h-48" />
      </Panel>
    )
  }
  if (stalls.error || users.error) {
    return (
      <Panel className={className}>
        <PanelError
          what="growth"
          onRetry={() => {
            stalls.refetch()
            users.refetch()
          }}
        />
      </Panel>
    )
  }

  const startTotal = totalOf(starts)
  const signupTotal = totalOf(signups)
  return (
    <Panel
      className={cn(
        'grid gap-0 divide-y p-0 md:grid-cols-2 md:divide-x md:divide-y-0 md:p-0',
        className,
      )}
    >
      <Trend
        title="New rental starts"
        total={startTotal}
        note={`Lease${startTotal === 1 ? '' : 's'} starting, ${format(startMonths[0], 'MMM')} to ${format(startMonths[5], 'MMM yyyy')}`}
        link="Open tenants"
        to="/dashboard/tenant-information"
        series={starts}
        color="var(--chart-1)"
      />
      <Trend
        title="New registrations"
        total={signupTotal}
        note={`Account${signupTotal === 1 ? '' : 's'} created, ${format(signupMonths[0], 'MMM')} to ${format(signupMonths[5], 'MMM yyyy')}`}
        link="Open users"
        to="/dashboard/admin"
        series={signups}
        color="var(--chart-1)"
      />
    </Panel>
  )
}

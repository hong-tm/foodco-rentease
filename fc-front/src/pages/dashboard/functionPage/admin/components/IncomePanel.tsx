import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'
import { format, isSameMonth, parse, startOfMonth, subMonths } from 'date-fns'
import { Link } from 'react-router-dom'

import { formatRM, formatSignedPercent } from '@/lib/format'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { Panel, PanelError } from '@/components/ui/panel'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ChartLegend, ColumnChart } from './ColumnChart'

const utilitySeries = [
  { key: 'electric', label: 'Electric', color: 'var(--chart-3)' },
  { key: 'water', label: 'Water', color: 'var(--chart-2)' },
]

function StatTab({
  value,
  label,
  figure,
  note,
}: {
  value: string
  label: string
  figure: string
  note: string
}) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        'h-auto flex-col items-start gap-0.5 rounded-none border-0 border-b-2 border-transparent bg-transparent px-4 py-3 text-left whitespace-normal shadow-none md:px-5',
        'hover:bg-accent/60 data-[state=active]:border-primary dark:data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none dark:data-[state=active]:bg-transparent',
      )}
    >
      <span className="type-meta text-muted-foreground">{label}</span>
      <span className="type-figure text-foreground">{figure}</span>
      <span className="type-meta text-muted-foreground font-normal">
        {note}
      </span>
    </TabsTrigger>
  )
}

/** Money in, one chart at a time: rent as a trend, utilities as stacked months. */
export default function IncomePanel({ className }: { className?: string }) {
  const { data, isLoading, error, refetch } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )
  const now = new Date()
  const records = data ?? []

  const rent = Array.from({ length: 6 }, (_, i) => {
    const month = startOfMonth(subMonths(now, 5 - i))
    return {
      label: format(month, 'MMM'),
      rent: records
        .filter(
          (record) =>
            record.paymentType === 'rental' &&
            record.paymentStatus &&
            isSameMonth(new Date(record.paymentDate), month),
        )
        .reduce((sum, record) => sum + Number(record.paymentAmount), 0),
    }
  })
  // Month to date against the same days of last month: a month in progress
  // is never compared with a whole month.
  const day = now.getDate()
  const lastMonth = subMonths(now, 1)
  const paidUpToDay = (types: string[], month: Date) =>
    records
      .filter((record) => {
        const date = new Date(record.paymentDate)
        return (
          types.includes(record.paymentType) &&
          record.paymentStatus &&
          isSameMonth(date, month) &&
          date.getDate() <= day
        )
      })
      .reduce((sum, record) => sum + Number(record.paymentAmount), 0)
  const pace = (types: string[]) => {
    const current = paidUpToDay(types, now)
    const previous = paidUpToDay(types, lastMonth)
    return {
      figure: formatRM(current),
      note: previous
        ? `${formatSignedPercent(((current - previous) / previous) * 100)} on ${format(lastMonth, 'MMM')} 1–${day}`
        : `Nothing paid by ${format(lastMonth, 'MMM')} ${day}`,
    }
  }
  const rentPace = pace(['rental'])
  const utilityPace = pace(['electric', 'water'])

  const utilities = records.filter(
    (record) =>
      record.paymentType === 'electric' || record.paymentType === 'water',
  )
  const unpaid = utilities.filter((record) => !record.paymentStatus)
  const unpaidTotal = unpaid.reduce(
    (sum, record) => sum + Number(record.paymentAmount),
    0,
  )
  const byMonth = new Map<string, { electric: number; water: number }>()
  utilities
    .filter((record) => record.paymentStatus)
    .forEach((record) => {
      const key = format(new Date(record.paymentDate), 'yyyy-MM')
      const entry = byMonth.get(key) ?? { electric: 0, water: 0 }
      entry[record.paymentType as 'electric' | 'water'] += Number(
        record.paymentAmount,
      )
      byMonth.set(key, entry)
    })
  const utilityChart = [...byMonth.keys()]
    .sort()
    .slice(-6)
    .map((key) => ({
      label: format(parse(key, 'yyyy-MM', new Date()), 'MMM'),
      ...byMonth.get(key)!,
    }))
  if (isLoading) {
    return (
      <Panel className={className}>
        <Skeleton className="h-80" />
      </Panel>
    )
  }
  if (error) {
    return (
      <Panel className={className}>
        <PanelError what="income" onRetry={() => refetch()} />
      </Panel>
    )
  }

  return (
    <Panel className={cn('gap-0 overflow-hidden p-0 md:p-0', className)}>
      <Tabs defaultValue="rent" className="flex-1 gap-0">
        <TabsList className="grid h-auto w-full grid-cols-2 items-stretch rounded-none border-b bg-transparent p-0">
          <StatTab
            value="rent"
            label={`Rent, ${format(now, 'MMM')} to date`}
            figure={rentPace.figure}
            note={rentPace.note}
          />
          <StatTab
            value="utilities"
            label={`Utilities, ${format(now, 'MMM')} to date`}
            figure={utilityPace.figure}
            note={utilityPace.note}
          />
        </TabsList>
        <TabsContent value="rent" className="flex flex-col gap-3 p-4 md:p-5">
          {/* Monthly totals: columns from zero, the honest shape for sums. */}
          <ColumnChart
            data={rent}
            series={[{ key: 'rent', label: 'Rent', color: 'var(--chart-1)' }]}
            // The month in progress carries the full hue; closed months its tint.
            colorOf={(datum) =>
              datum === rent[rent.length - 1]
                ? 'var(--chart-1)'
                : 'var(--chart-1-soft)'
            }
            height={208}
            formatTick={(value) =>
              value >= 1000 ? `${value / 1000}k` : String(value)
            }
            formatValue={formatRM}
          />
          <p className="type-meta text-muted-foreground flex justify-between gap-3">
            <span>Paid rent per month</span>
            <Button variant="quiet" asChild>
              <Link to="/dashboard/admin-report">Open report</Link>
            </Button>
          </p>
        </TabsContent>
        <TabsContent
          value="utilities"
          className="flex flex-col gap-3 p-4 md:p-5"
        >
          <ChartLegend series={utilitySeries} />
          <ColumnChart
            data={utilityChart}
            series={utilitySeries}
            height={176}
            formatTick={String}
            formatValue={formatRM}
          />
          <p className="type-meta text-muted-foreground flex justify-between gap-3">
            <span>
              {unpaid.length > 0 ? (
                <>
                  <span className="text-negative-ink font-medium">
                    {formatRM(unpaidTotal)} unpaid
                  </span>{' '}
                  across {unpaid.length} bill{unpaid.length === 1 ? '' : 's'}
                </>
              ) : (
                'All bills are paid'
              )}
            </span>
            <Button variant="quiet" asChild>
              <Link to="/dashboard/stall-payment">Review bills</Link>
            </Button>
          </p>
        </TabsContent>
      </Tabs>
    </Panel>
  )
}

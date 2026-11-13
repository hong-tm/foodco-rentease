import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { format, isSameMonth, parse, startOfMonth, subMonths } from 'date-fns'

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

const changeNote = (latest?: number, previous?: number) =>
  latest !== undefined && previous
    ? `${formatSignedPercent(((latest - previous) / previous) * 100)} on last month`
    : 'No earlier month to compare'

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
  const rentMonths = rent.filter((point) => point.rent > 0)
  const rentLatest = rentMonths[rentMonths.length - 1]?.rent
  const rentPrevious = rentMonths[rentMonths.length - 2]?.rent

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
  const totalOf = (point?: { electric: number; water: number }) =>
    point ? point.electric + point.water : undefined
  const utilityLatest = totalOf(utilityChart[utilityChart.length - 1])
  const utilityPrevious = totalOf(utilityChart[utilityChart.length - 2])

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
            label="Rent collected"
            figure={rentLatest !== undefined ? formatRM(rentLatest) : '—'}
            note={changeNote(rentLatest, rentPrevious)}
          />
          <StatTab
            value="utilities"
            label="Utilities collected"
            figure={utilityLatest !== undefined ? formatRM(utilityLatest) : '—'}
            note={changeNote(utilityLatest, utilityPrevious)}
          />
        </TabsList>
        <TabsContent value="rent" className="flex flex-col gap-3 p-4 md:p-5">
          {/* Monthly totals: columns from zero, the honest shape for sums. */}
          <ColumnChart
            data={rent}
            series={[{ key: 'rent', label: 'Rent', color: 'var(--chart-1)' }]}
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

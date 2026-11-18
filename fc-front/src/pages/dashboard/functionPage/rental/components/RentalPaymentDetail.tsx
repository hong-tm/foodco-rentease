import { useState } from 'react'
import type { PaymentRecord } from '@/api/paymentApi'
import {
  ColumnChart,
  type ColumnSeries,
} from '@/pages/dashboard/functionPage/admin/components/ColumnChart'
import { format, isSameMonth, startOfMonth, subMonths } from 'date-fns'

import { formatRM } from '@/lib/format'
import { cn } from '@/lib/utils'

import { Panel, PanelError, PanelHeader } from '@/components/ui/panel'
import { StatStrip } from '@/components/ui/panel-parts'
import { Skeleton } from '@/components/ui/skeleton'

type PaymentKind = 'rental' | 'electric' | 'water'

const series: (ColumnSeries & { key: PaymentKind })[] = [
  { key: 'rental', label: 'Rent', color: 'var(--chart-1)' },
  { key: 'electric', label: 'Electric', color: 'var(--chart-3)' },
  { key: 'water', label: 'Water', color: 'var(--chart-2)' },
]

const sum = (records: PaymentRecord[]) =>
  records.reduce((total, record) => total + Number(record.paymentAmount), 0)

function SeriesToggle({
  hidden,
  onToggle,
}: {
  hidden: PaymentKind[]
  onToggle: (key: PaymentKind) => void
}) {
  return (
    <div
      role="group"
      aria-label="Show or hide a payment type"
      className="flex flex-wrap gap-1"
    >
      {series.map((s) => {
        const shown = !hidden.includes(s.key)
        return (
          <button
            key={s.key}
            type="button"
            aria-pressed={shown}
            onClick={() => onToggle(s.key)}
            className={cn(
              'type-meta hover:bg-accent focus-visible:ring-ring inline-flex h-11 items-center gap-1.5 rounded-md px-2.5 outline-none focus-visible:ring-2 md:h-8',
              shown ? 'text-foreground' : 'text-muted-foreground line-through',
            )}
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-xs border-2"
              style={{
                borderColor: s.color,
                background: shown ? s.color : 'transparent',
              }}
            />
            {s.label}
          </button>
        )
      })}
    </div>
  )
}

export default function RentalPaymentDetail({
  payments,
  due,
  isLoading,
  error,
  onRetry,
}: {
  payments: PaymentRecord[]
  due: { count: number; total: number }
  isLoading: boolean
  error: boolean
  onRetry: () => void
}) {
  const [hidden, setHidden] = useState<PaymentKind[]>([])
  const now = new Date()
  const paid = payments.filter((payment) => payment.paymentStatus)
  const paidIn = (month: Date) =>
    paid.filter((payment) => isSameMonth(new Date(payment.paymentDate), month))

  const months = Array.from({ length: 6 }, (_, i) =>
    startOfMonth(subMonths(now, 5 - i)),
  )
  const chart = months.map((month) => {
    const inMonth = paidIn(month)
    return {
      label: format(month, 'MMM'),
      ...Object.fromEntries(
        series.map((s) => [
          s.key,
          sum(inMonth.filter((payment) => payment.paymentType === s.key)),
        ]),
      ),
    }
  })
  const lastMonth = subMonths(now, 1)
  const thisMonthTotal = sum(paidIn(now))
  const lastMonthTotal = sum(paidIn(lastMonth))
  const windowRecords = months.flatMap(paidIn)
  const rentTotal = sum(
    windowRecords.filter((payment) => payment.paymentType === 'rental'),
  )
  const windowTotal = sum(windowRecords)

  const toggle = (key: PaymentKind) =>
    setHidden((current) =>
      current.includes(key)
        ? current.filter((k) => k !== key)
        : current.length === series.length - 1
          ? current
          : [...current, key],
    )

  return (
    <Panel>
      <PanelHeader
        title="Payments"
        meta={`Paid each month, ${format(months[0], 'MMM')} to ${format(now, 'MMM yyyy')}`}
      />
      {isLoading ? (
        <Skeleton className="h-72" />
      ) : error ? (
        <PanelError what="your payments" onRetry={onRetry} />
      ) : (
        <>
          <StatStrip
            stats={[
              {
                label: `Paid in ${format(now, 'MMMM')}`,
                value: formatRM(thisMonthTotal),
                note: `${formatRM(lastMonthTotal)} in ${format(lastMonth, 'MMMM')}`,
              },
              {
                label: 'Last 6 months',
                value: formatRM(windowTotal),
                note: `Rent ${formatRM(rentTotal)} · utilities ${formatRM(windowTotal - rentTotal)}`,
              },
              {
                label: 'Unpaid',
                value: formatRM(due.total),
                tone: due.count > 0 ? 'warning' : undefined,
                note:
                  due.count > 0
                    ? `${due.count} bill${due.count === 1 ? '' : 's'} waiting`
                    : 'Nothing waiting',
              },
            ]}
          />
          <SeriesToggle hidden={hidden} onToggle={toggle} />
          <ColumnChart
            data={chart}
            series={series.filter((s) => !hidden.includes(s.key))}
            height={224}
            formatTick={(value) =>
              value >= 1000 ? `${value / 1000}k` : String(value)
            }
            formatValue={formatRM}
          />
        </>
      )}
    </Panel>
  )
}

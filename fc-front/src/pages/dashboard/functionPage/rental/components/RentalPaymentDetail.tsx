import React from 'react'
import { useSession } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartEmpty } from '@/components/dashboard/ChartEmpty'
import {
  monthSummary,
  monthlyPaidTotals,
} from '@/components/dashboard/monthlyTotals'
import { rm } from '@/lib/format'

const TYPES = ['rental', 'water', 'electric'] as const

const chartConfig = {
  rental: {
    label: 'Rent',
    color: 'var(--series-1)',
  },
  utilities: {
    label: 'Utilities',
    color: 'var(--series-2)',
  },
} satisfies ChartConfig

export type RentalPaymentDetailProps = {
  records?: PaymentRecord[]
  isLoading?: boolean
}

export default function RentalPaymentDetail({
  records: propRecords,
  isLoading: propIsLoading,
}: RentalPaymentDetailProps = {}) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const { data: queryRecords, isLoading: queryIsLoading } = useQuery({
    ...getAllPaymentRecordsQueryOptions,
    enabled: propRecords === undefined,
  })

  const isLoading = propIsLoading ?? queryIsLoading

  const userRecords = React.useMemo(() => {
    if (propRecords) return propRecords
    return (queryRecords ?? []).filter((record) => record.userId === userId)
  }, [propRecords, queryRecords, userId])

  const data = React.useMemo(
    () =>
      monthlyPaidTotals(userRecords, TYPES, 6).map((slot) => {
        const utilities = slot.water + slot.electric
        const total = slot.rental + utilities
        return {
          ...slot,
          utilities,
          total,
        }
      }),
    [userRecords],
  )

  const hasAnyPayments = data.some((month) => month.total > 0)
  const current = data[data.length - 1]
  const previous = data[data.length - 2]
  const footer =
    current && previous
      ? monthSummary(current.total, previous.total, [
          current.month,
          previous.month,
        ])
      : undefined

  return (
    <section aria-label="Payments" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="type-section-title">Payments</h2>
        <p className="text-muted-foreground text-sm">
          Settled rent and utilities by record month, last 6 months
        </p>
      </div>

      {isLoading ? (
        <div role="status" aria-busy="true" className="flex flex-col gap-2">
          <span className="sr-only">Loading payment history…</span>
          <Skeleton className="h-[220px] w-full" />
          <Skeleton className="h-4 w-64" />
        </div>
      ) : !hasAnyPayments ? (
        <ChartEmpty message="No payments recorded in the last 6 months" />
      ) : (
        <>
          <ChartContainer config={chartConfig} className="h-[220px] w-full">
            <BarChart
              accessibilityLayer
              data={data}
              margin={{ top: 8, right: 0, left: 8, bottom: 0 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="shortMonth"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                width={52}
                tickFormatter={(v: number) =>
                  'RM ' + new Intl.NumberFormat('en-MY').format(v)
                }
                tickLine={false}
                axisLine={false}
                tickCount={4}
                allowDecimals={false}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    formatter={(value, name) =>
                      `${chartConfig[name as keyof typeof chartConfig]?.label ?? name}: RM ${rm(Number(value))}`
                    }
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="rental"
                stackId="payments"
                fill="var(--color-rental)"
                maxBarSize={56}
              />
              <Bar
                dataKey="utilities"
                stackId="payments"
                fill="var(--color-utilities)"
                radius={[3, 3, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ChartContainer>
          {footer ? (
            <p className="text-muted-foreground text-sm tabular-nums">
              {footer}
            </p>
          ) : null}
        </>
      )}
    </section>
  )
}

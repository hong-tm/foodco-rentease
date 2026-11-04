import React from 'react'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartEmpty } from '@/components/dashboard/ChartEmpty'
import {
  monthSummary,
  monthlyPaidTotals,
  rm,
} from '@/components/dashboard/monthlyTotals'

const TYPES = ['rental'] as const

const chartConfig = {
  rental: {
    label: 'Rent collected (RM)',
    color: 'var(--series-1)',
  },
} satisfies ChartConfig

function Shell({
  children,
  footer,
}: {
  children: React.ReactNode
  footer?: string
}) {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Rent collected</CardTitle>
        <CardDescription>
          Settled rent by record month, last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer ? (
        <CardFooter className="text-muted-foreground text-sm tabular-nums">
          {footer}
        </CardFooter>
      ) : null}
    </Card>
  )
}

export default function StallRentalPaymentChart() {
  const { data: paymentRecords } = useQuery(getAllPaymentRecordsQueryOptions)

  const data = React.useMemo(
    () => monthlyPaidTotals((paymentRecords ?? []) as PaymentRecord[], TYPES),
    [paymentRecords],
  )

  if (!data.some((month) => month.rental > 0)) {
    return (
      <Shell>
        <ChartEmpty message="No rent collected in the last 6 months" />
      </Shell>
    )
  }

  const current = data[data.length - 1]
  const previous = data[data.length - 2]
  return (
    <Shell
      footer={monthSummary(current.rental, previous.rental, [
        current.month,
        previous.month,
      ])}
    >
      <ChartContainer config={chartConfig} className="h-[220px] w-full">
        <BarChart accessibilityLayer data={data} margin={{ top: 8 }}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="shortMonth"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            width={44}
            tickLine={false}
            axisLine={false}
            tickCount={4}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                formatter={(value) => `RM ${rm(Number(value))}`}
              />
            }
          />
          <Bar
            dataKey="rental"
            fill="var(--color-rental)"
            radius={3}
            maxBarSize={48}
          />
        </BarChart>
      </ChartContainer>
    </Shell>
  )
}

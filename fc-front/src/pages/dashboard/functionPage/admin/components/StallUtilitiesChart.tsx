import React from 'react'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useQuery } from '@tanstack/react-query'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

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
  ChartLegend,
  ChartLegendContent,
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

const chartConfig = {
  electric: {
    label: 'Electric',
    color: 'var(--series-1)',
  },
  water: {
    label: 'Water',
    color: 'var(--series-2)',
  },
} satisfies ChartConfig

const TYPES = ['electric', 'water'] as const

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
        <CardTitle>Utilities collected</CardTitle>
        <CardDescription>
          Settled water and electricity by record month, last 6 months
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

export default function StallUtilitiesChart() {
  const { data: paymentRecords } = useQuery(getAllPaymentRecordsQueryOptions)

  const data = React.useMemo(
    () =>
      monthlyPaidTotals((paymentRecords ?? []) as PaymentRecord[], TYPES).map(
        (slot) => ({ ...slot, total: slot.electric + slot.water }),
      ),
    [paymentRecords],
  )

  if (!data.some((month) => month.total > 0)) {
    return (
      <Shell>
        <ChartEmpty message="No utilities collected in the last 6 months" />
      </Shell>
    )
  }

  const current = data[data.length - 1]
  const previous = data[data.length - 2]

  return (
    <Shell
      footer={monthSummary(current.total, previous.total, [
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
          <Bar dataKey="water" stackId="u" fill="var(--color-water)" />
          <Bar
            dataKey="electric"
            stackId="u"
            fill="var(--color-electric)"
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ChartContainer>
    </Shell>
  )
}

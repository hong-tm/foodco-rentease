import React from 'react'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useQuery } from '@tanstack/react-query'
import { TrendingUpIcon } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type MonthlyData = {
  month: string
  monthOrder: number
  displayMonth: string
  electric: number
  water: number
}

const chartConfig = {
  electric: {
    label: 'Electric',
    color: 'var(--chart-1)',
  },
  water: {
    label: 'Water',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

const formatMonth = (date: Date) => {
  return date.toLocaleString('en-US', { month: 'short', year: 'numeric' })
}

export default function StallUtilitiesChart() {
  const { data: paymentRecords } = useQuery(getAllPaymentRecordsQueryOptions)

  // Process payment records to get monthly totals for electric and water
  const processedData = React.useMemo(() => {
    if (!paymentRecords) return []

    const monthlyData = new Map<string, MonthlyData>()

    ;(paymentRecords as PaymentRecord[]).forEach((record) => {
      if (!record.paymentStatus) return
      if (record.paymentType !== 'electric' && record.paymentType !== 'water')
        return

      const date = new Date(record.paymentDate)
      const monthKey = date.toLocaleString('default', {
        month: 'long',
        year: 'numeric',
      })
      const monthOrder = date.getFullYear() * 12 + date.getMonth()
      const displayMonth = formatMonth(date)

      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month: monthKey,
          monthOrder,
          displayMonth,
          electric: 0,
          water: 0,
        })
      }

      const currentData = monthlyData.get(monthKey)!
      const amount = Number(record.paymentAmount)
      if (record.paymentType === 'electric') {
        currentData.electric = (currentData.electric || 0) + amount
      } else {
        currentData.water = (currentData.water || 0) + amount
      }
      monthlyData.set(monthKey, currentData)
    })

    // Sort by monthOrder and get last 3 months
    return Array.from(monthlyData.values())
      .sort((a, b) => a.monthOrder - b.monthOrder)
      .slice(-3)
  }, [paymentRecords])

  // Calculate trending percentage
  const getTrendingPercentage = () => {
    if (processedData.length < 2) return 0
    const lastMonth = processedData[processedData.length - 1]
    const previousMonth = processedData[processedData.length - 2]
    const lastTotal = (lastMonth.electric || 0) + (lastMonth.water || 0)
    const prevTotal = (previousMonth.electric || 0) + (previousMonth.water || 0)
    return prevTotal === 0 ? 0 : ((lastTotal - prevTotal) / prevTotal) * 100
  }

  const trendingPercentage = getTrendingPercentage()

  // Format date range for display
  const getDateRangeText = () => {
    if (processedData.length === 0) return ''
    const firstMonth = processedData[0]?.displayMonth
    const lastMonth = processedData[processedData.length - 1]?.displayMonth
    return `${firstMonth} - ${lastMonth}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilities Payment Chart</CardTitle>
        <CardDescription>
          Showing total utilities payments for the last 3 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={processedData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="displayMonth"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillElectric" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-electric)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-electric)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillWater" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-water)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-water)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="water"
              type="natural"
              fill="url(#fillWater)"
              fillOpacity={0.4}
              stroke="var(--color-water)"
              stackId="a"
            />
            <Area
              dataKey="electric"
              type="natural"
              fill="url(#fillElectric)"
              fillOpacity={0.4}
              stroke="var(--color-electric)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {trendingPercentage > 0 ? 'Trending up' : 'Trending down'} by{' '}
              <TrendingUpIcon
                className={`h-4 w-4 ${
                  trendingPercentage < 0
                    ? 'text-destructive rotate-180'
                    : 'text-green-500'
                }`}
              />
              {Math.abs(trendingPercentage).toFixed(1)}% this month{' '}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {getDateRangeText()}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

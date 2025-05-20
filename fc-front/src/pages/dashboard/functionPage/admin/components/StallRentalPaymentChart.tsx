import React from 'react'
import { TrendingUpIcon } from 'lucide-react'
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from 'recharts'
import { useQuery } from '@tanstack/react-query'
import type { PaymentRecord } from '@server/lib/sharedType'
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
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'

const chartConfig = {
  rental: {
    label: 'Rental',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

// Helper function to get months around current month
const getMonthsAroundCurrent = () => {
  const months = []
  const today = new Date()

  // Add 3 months back and 2 months forward
  for (let i = -3; i <= 2; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1)
    months.push({
      month: date.toLocaleString('en-US', { month: 'long' }),
      shortMonth: date.toLocaleString('en-US', { month: 'short' }),
      date: date,
    })
  }

  return months
}

// Helper function to format date range
const getDateRangeText = () => {
  const today = new Date()
  const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, 1)
  const twoMonthsAhead = new Date(today.getFullYear(), today.getMonth() + 2, 1)

  return `${threeMonthsAgo.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  })} - ${twoMonthsAhead.toLocaleString('en-US', {
    month: 'short',
    year: 'numeric',
  })}`
}

export default function StallRentalPaymentChart() {
  const { data: paymentRecords } = useQuery(getAllPaymentRecordsQueryOptions)

  // Process payment records to get monthly totals for rental
  const processedData = React.useMemo(() => {
    if (!paymentRecords) return []

    const monthlyData = new Map<string, number>()

    ;(paymentRecords as PaymentRecord[]).forEach((record) => {
      if (!record.paymentStatus) return
      if (record.paymentType !== 'rental') return

      const date = new Date(record.paymentDate)
      const month = date.toLocaleString('en-US', { month: 'long' })

      const currentAmount = monthlyData.get(month) || 0
      monthlyData.set(month, currentAmount + Number(record.paymentAmount))
    })

    // Get months around current month
    const months = getMonthsAroundCurrent()
    const result = months.map(({ month, shortMonth }) => ({
      month,
      shortMonth,
      rental: monthlyData.get(month) || 0,
    }))

    // Log the data for verification
    // console.log("Monthly rental data:", result);
    return result
  }, [paymentRecords])

  // Calculate trending percentage
  const getTrendingPercentage = () => {
    if (processedData.length < 2) return 0

    // Find the last two months with non-zero values
    const nonZeroMonths = processedData
      .filter((data) => data.rental > 0)
      .slice(-2)

    if (nonZeroMonths.length < 2) return 0

    const lastMonth = nonZeroMonths[1]
    const previousMonth = nonZeroMonths[0]

    // console.log('Trending calculation:', {
    //   lastMonth: lastMonth.month,
    //   lastValue: lastMonth.rental,
    //   previousMonth: previousMonth.month,
    //   previousValue: previousMonth.rental,
    // })

    return (
      ((lastMonth.rental - previousMonth.rental) / previousMonth.rental) * 100
    )
  }

  const trendingPercentage = getTrendingPercentage()

  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Rental Payment Chart</CardTitle>
        <CardDescription>
          Showing rental payments 3 months back and 2 months ahead
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={processedData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <PolarGrid />
            <PolarAngleAxis
              dataKey="shortMonth"
              tick={{ fill: 'var(--muted-foreground)' }}
            />
            <Radar
              dataKey="rental"
              fill="var(--color-rental)"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
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
      </CardFooter>
    </Card>
  )
}

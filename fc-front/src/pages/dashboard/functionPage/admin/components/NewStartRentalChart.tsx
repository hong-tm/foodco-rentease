import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import { TrendingUpIcon } from 'lucide-react'
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

export function NewStartRentalChart() {
  const { data: stallData } = useQuery(fetchStallsQueryOptions)

  // Process stall data to count stalls by month
  const processStallData = () => {
    if (!stallData?.stall) return []

    // Get date range (3 months back, current month, 2 months forward)
    const currentDate = new Date()
    const threeMonthsAgo = new Date()
    const twoMonthsForward = new Date()
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3)
    twoMonthsForward.setMonth(currentDate.getMonth() + 2)

    // Initialize array with 6 months (-3 to +2)
    const monthsArray = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(currentDate.getMonth() - 3 + i) // Start from 3 months ago
      return {
        month: date.toLocaleString('en-US', { month: 'long' }),
        value: 0,
        shortMonth: date.toLocaleString('en-US', { month: 'short' }),
      }
    })

    // Count stalls for each month
    stallData.stall.forEach((stall) => {
      if (!stall.startAt) return
      const startDate = new Date(stall.startAt)

      // Only count if within our date range
      if (startDate >= threeMonthsAgo && startDate <= twoMonthsForward) {
        const month = startDate.toLocaleString('en-US', { month: 'long' })
        const monthData = monthsArray.find((m) => m.month === month)
        if (monthData) {
          monthData.value++
        }
      }
    })

    return monthsArray
  }

  const chartData = processStallData()
  const hasData = chartData.some((item) => item.value > 0)

  // Calculate trending percentage
  const calculateTrending = () => {
    if (chartData.length < 2) return 0
    const currentMonthIndex = chartData.findIndex(
      (item) =>
        item.month === new Date().toLocaleString('en-US', { month: 'long' }),
    )
    if (currentMonthIndex === -1 || currentMonthIndex === 0) return 0

    const currentValue = chartData[currentMonthIndex].value
    const previousValue = chartData[currentMonthIndex - 1].value
    if (previousValue === 0) return 100
    return ((currentValue - previousValue) / previousValue) * 100
  }

  const trendingPercentage = calculateTrending()

  const chartConfig = {
    value: { label: 'New rentals', color: 'var(--series-1)' },
  } satisfies ChartConfig

  const getDateRange = () => {
    const currentDate = new Date()
    const threeMonthsAgo = new Date()
    const twoMonthsForward = new Date()
    threeMonthsAgo.setMonth(currentDate.getMonth() - 3)
    twoMonthsForward.setMonth(currentDate.getMonth() + 2)
    return `${threeMonthsAgo.toLocaleString('en-US', {
      month: 'long',
    })} - ${twoMonthsForward.toLocaleString('en-US', {
      month: 'long',
    })} ${currentDate.getFullYear()}`
  }

  const peak =
    chartData.length > 0
      ? chartData.reduce((max, item) => (item.value > max.value ? item : max))
      : null

  if (!hasData) {
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>New Rental Starts</CardTitle>
          <CardDescription>{getDateRange()}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartEmpty message="No rental starts in this window" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="flex flex-col shadow-none">
      <CardHeader>
        <CardTitle>New Rental Starts</CardTitle>
        <CardDescription>{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ChartContainer config={chartConfig} className="h-[220px] w-full">
          <BarChart accessibilityLayer data={chartData} margin={{ top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="shortMonth"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              width={28}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              tickCount={4}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={3}
              maxBarSize={48}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="text-muted-foreground text-sm">
        <div className="flex items-center gap-2">
          {peak &&
            peak.value > 0 &&
            `Most starts in ${peak.month} with ${peak.value} ${
              peak.value === 1 ? 'stall' : 'stalls'
            }`}
          <TrendingUpIcon
            className={`h-4 w-4 ${
              trendingPercentage < 0
                ? 'text-destructive rotate-180'
                : 'text-muted-foreground'
            }`}
          />
        </div>
      </CardFooter>
    </Card>
  )
}

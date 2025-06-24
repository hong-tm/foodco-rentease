import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import { TrendingUpIcon } from 'lucide-react'
import { LabelList, RadialBar, RadialBarChart } from 'recharts'

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
        fill: `var(--chart-${(i % 5) + 1})`,
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

  const chartConfig = chartData.reduce((acc: any, item) => {
    acc[item.month] = {
      label: item.month,
      color: item.fill,
    }
    return acc
  }, {}) satisfies ChartConfig

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

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>New Rental Starts</CardTitle>
        <CardDescription>{getDateRange()}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart data={chartData} innerRadius={30} outerRadius={100}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="month" />}
            />
            <RadialBar dataKey="value" background>
              <LabelList
                position="insideStart"
                dataKey="month"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {chartData.length > 0 &&
            `Most starts in ${
              chartData.reduce((max, item) =>
                item.value > max.value ? item : max,
              ).month
            } with ${
              chartData.reduce((max, item) =>
                item.value > max.value ? item : max,
              ).value
            } stalls`}
          <TrendingUpIcon
            className={`h-4 w-4 ${
              trendingPercentage < 0
                ? 'text-destructive rotate-180'
                : 'text-green-500'
            }`}
          />
        </div>
        <div className="text-muted-foreground leading-none">
          Showing rental starts by month for {getDateRange()}
        </div>
      </CardFooter>
    </Card>
  )
}

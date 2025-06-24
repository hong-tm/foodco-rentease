import { fetchUsersQueryOptions } from '@/api/adminApi'
import { useQuery } from '@tanstack/react-query'
import { TrendingDownIcon, TrendingUpIcon } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

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

export default function NewTenantChart() {
  const { data: usersData, isLoading } = useQuery(fetchUsersQueryOptions)

  // Process user data to get monthly counts
  const processUserData = () => {
    // Get current date and create array of last 3 months
    const now = new Date()
    const months = Array.from({ length: 3 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (2 - i))
      return {
        monthKey: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
          2,
          '0',
        )}`,
        month: date.toLocaleString('en-US', { month: 'long' }),
        users: '',
      }
    })

    if (!usersData?.users) return months

    // Create a map for easy lookup
    const monthsMap = new Map(
      months.map((month) => [month.monthKey, { ...month }]),
    )

    // Sort users by creation date
    const sortedUsers = [...usersData.users].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )

    // Count monthly totals
    sortedUsers.forEach((user) => {
      const date = new Date(user.createdAt)
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1,
      ).padStart(2, '0')}`

      if (monthsMap.has(monthKey)) {
        const monthData = monthsMap.get(monthKey)!
        monthData.users =
          monthData.users === '' ? '1' : String(parseInt(monthData.users) + 1)
      }
    })

    // Convert map back to array, maintaining order
    return months.map((month) => monthsMap.get(month.monthKey)!)
  }

  const chartData = processUserData()

  const chartConfig = {
    users: {
      label: 'New Users',
      color: 'var(--chart-2)',
    },
    label: {
      color: 'var(--background)',
    },
  } satisfies ChartConfig

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Registration</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <div className="animate-pulse">Loading chart data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly User Registrations</CardTitle>
        <CardDescription>Registration counts by month</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="month"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="users" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar
              dataKey="users"
              layout="vertical"
              fill="hsl(var(--chart-1))"
              radius={4}
              stackId="stack"
            >
              <LabelList
                dataKey="month"
                position="insideLeft"
                offset={8}
                className="fill-background"
                fontSize={12}
              />
              <LabelList
                dataKey="users"
                position="right"
                offset={8}
                className="fill-foreground data-[value=''']:fill-muted-foreground"
                fontSize={12}
                formatter={(value: string) => value || '-'}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Monthly registration totals
        </div>
        <div className="text-muted-foreground flex flex-col gap-1 text-xs">
          {(() => {
            const lastMonth = chartData[chartData.length - 1]
            const prevMonth = chartData[chartData.length - 2]
            if (!lastMonth.users || !prevMonth.users) return null

            const change =
              ((parseInt(lastMonth.users) - parseInt(prevMonth.users)) /
                parseInt(prevMonth.users)) *
              100

            return (
              <>
                <div className="flex items-center gap-1">
                  <span>Trend Analysis:</span>
                  <span
                    className={change >= 0 ? 'text-green-500' : 'text-red-500'}
                  >
                    {change >= 0 ? (
                      <TrendingUpIcon className="inline h-4 w-4" />
                    ) : (
                      <TrendingDownIcon className="inline h-4 w-4" />
                    )}
                    {change >= 0 ? '+' : ''}
                    {change.toFixed(1)}% vs previous month
                  </span>
                </div>
                <div>
                  {change >= 0
                    ? 'Growing user acquisition - consider expanding resources'
                    : 'Declining registrations - may need marketing attention'}
                </div>
              </>
            )
          })()}
        </div>
      </CardFooter>
    </Card>
  )
}

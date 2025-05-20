import { getFeedbackHappinessQueryOptions } from '@/api/feedbackApi'
import { useQuery } from '@tanstack/react-query'
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  AlertTriangleIcon,
  TrendingDownIcon,
  TrendingUpIcon,
} from 'lucide-react'

interface FeedbackHapinessLineChartProps {
  className?: string
}

export default function FeedbackHapinessLineChart({
  className,
}: FeedbackHapinessLineChartProps) {
  const { data: feedbackHappiness } = useQuery(getFeedbackHappinessQueryOptions)

  const chartConfig = {
    happiness: {
      label: 'Happiness Score',
      color: 'var(--chart-1)',
    },
  } satisfies ChartConfig

  // Calculate analytics
  const getAnalytics = () => {
    if (!feedbackHappiness || feedbackHappiness.length === 0) return null

    const totalHappiness = feedbackHappiness.reduce(
      (acc, curr) => acc + curr.totalHappiness,
      0,
    )

    const lowestStall = feedbackHappiness.reduce((min, curr) =>
      curr.totalHappiness < min.totalHappiness ? curr : min,
    )

    const highestStall = feedbackHappiness.reduce((max, curr) =>
      curr.totalHappiness > max.totalHappiness ? curr : max,
    )

    return {
      totalHappiness,
      lowestStall,
      highestStall,
      status:
        totalHappiness >= 300
          ? 'Positive'
          : totalHappiness >= 200
            ? 'Neutral'
            : 'Concerning',
    }
  }

  const analytics = getAnalytics()

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col items-stretch space-y-0 border-b p-0">
        <div className="flex flex-1 flex-col justify-center gap-1 px-6 py-5">
          <CardTitle>Stall Happiness</CardTitle>
          <CardDescription>
            Showing happiness scores across different stalls
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto px-2 sm:p-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full min-w-[500px]"
        >
          <LineChart
            accessibilityLayer
            data={feedbackHappiness}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="stallId"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              interval={0}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  nameKey="happiness"
                />
              }
            />
            <Line
              dataKey="totalHappiness"
              type="monotone"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      {analytics && (
        <CardFooter className="flex flex-row flex-wrap items-center justify-between border-t p-4">
          <div className="flex items-center gap-2">
            {analytics.status === 'Positive' ? (
              <TrendingUpIcon className="h-3.5 w-3.5 text-green-500" />
            ) : analytics.status === 'Concerning' ? (
              <AlertTriangleIcon className="h-3.5 w-3.5 text-red-500" />
            ) : (
              <TrendingDownIcon className="h-3.5 w-3.5 text-yellow-500" />
            )}
            <span className="text-sm font-medium">{analytics.status}</span>
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-4 text-xs">
            <span>Highest: {analytics.highestStall.totalHappiness}</span>
            <span>Best: Stall {analytics.highestStall.stallId}</span>
            <span className="text-destructive">
              Attention: Stall {analytics.lowestStall.stallId}
            </span>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}

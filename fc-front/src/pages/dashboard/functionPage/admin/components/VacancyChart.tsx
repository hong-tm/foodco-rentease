import { fetchCurrentVacancyQueryOptions, stallsQueryKey } from '@/api/stallApi'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ThumbsDownIcon, ThumbsUpIcon } from 'lucide-react'
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { type ChartConfig, ChartContainer } from '@/components/ui/chart'

const chartConfig = {
  occupiedStalls: {
    label: 'Rented',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function VacancyChart() {
  const { data, error } = useQuery(fetchCurrentVacancyQueryOptions)
  const queryClient = useQueryClient()

  queryClient.invalidateQueries({
    queryKey: stallsQueryKey.getVacancy(),
  })

  if (error) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle>Error Loading Data</CardTitle>
          <CardDescription>Unable to fetch stall rental status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Please try again later</p>
        </CardContent>
      </Card>
    )
  }

  const currentMonth = new Date().toLocaleString('en-US', {
    month: 'long',
  })

  const totalStalls = data?.totalStalls || 0
  const rentedStalls =
    data?.stalls?.filter((stall) => stall.rentStatus === true).length || 0
  const rentedRate =
    totalStalls > 0 ? ((rentedStalls / totalStalls) * 100).toFixed(1) : '0.0'
  const endAngle = totalStalls > 0 ? (rentedStalls / totalStalls) * 360 : 0

  // Analyze vacancy status
  const vacancyStatus = {
    status:
      Number(rentedRate) >= 80
        ? 'High Demand'
        : Number(rentedRate) <= 40
          ? 'Low Occupancy'
          : 'Moderate',
    suggestion:
      Number(rentedRate) >= 80
        ? 'Consider expanding capacity or adjusting rental rates'
        : Number(rentedRate) <= 40
          ? 'Review pricing strategy or improve marketing efforts'
          : 'Maintain current operations while monitoring trends',
    trend:
      Number(rentedRate) >= 60 ? (
        <ThumbsUpIcon className="h-4 w-4 text-green-500" />
      ) : (
        <ThumbsDownIcon className="h-4 w-4 text-red-500" />
      ),
  }

  const chartData = [
    {
      occupiedStalls: rentedStalls || 0,
      fill: 'var(--color-occupiedStalls)',
    },
  ]

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Stall Rental Status</CardTitle>
        <CardDescription>{currentMonth} Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={endAngle}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="occupiedStalls" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {rentedRate}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Rented Rate
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          {currentMonth} rental rate is {rentedRate}%
          <span className="flex items-center gap-1 text-balance">
            ({vacancyStatus.status}) {vacancyStatus.trend}
          </span>
        </div>
        <div className="text-muted-foreground leading-none">
          {rentedStalls} stalls rented out of {totalStalls} total stalls
        </div>
        <div className="text-muted-foreground mt-2 text-xs">
          Suggestion: {vacancyStatus.suggestion}
        </div>
      </CardFooter>
    </Card>
  )
}

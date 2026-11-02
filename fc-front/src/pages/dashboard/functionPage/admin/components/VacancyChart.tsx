import { fetchCurrentVacancyQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
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
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { ChartEmpty } from '@/components/dashboard/ChartEmpty'

const chartConfig = {
  occupiedStalls: {
    label: 'Rented',
    color: 'var(--series-1)',
  },
} satisfies ChartConfig

export function VacancyChart() {
  const { data, error } = useQuery(fetchCurrentVacancyQueryOptions)

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
    data?.stalls?.filter((stall) => {
      if (stall.rentStatus !== true) return false
      if (!stall.endAt) return true
      return new Date(stall.endAt).getTime() >= Date.now()
    }).length || 0
  const rentedRate =
    totalStalls > 0 ? ((rentedStalls / totalStalls) * 100).toFixed(1) : '0.0'
  const endAngle = totalStalls > 0 ? (rentedStalls / totalStalls) * 360 : 0

  if (totalStalls === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Stall Rental Status</CardTitle>
          <CardDescription>{currentMonth} Overview</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartEmpty message="No stall data yet" />
        </CardContent>
      </Card>
    )
  }

  const chartData = [
    {
      occupiedStalls: rentedStalls || 0,
      fill: 'var(--color-occupiedStalls)',
    },
  ]

  return (
    <Card className="flex h-full flex-col shadow-none">
      <CardHeader className="items-center pb-0">
        <CardTitle>Stall Rental Status</CardTitle>
        <CardDescription>{currentMonth} Overview</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <p className="sr-only">
          {rentedStalls} of {totalStalls} stalls rented
        </p>
        <ChartContainer
          config={chartConfig}
          aria-hidden="true"
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
                          className="fill-foreground text-2xl font-semibold tabular-nums"
                        >
                          {rentedStalls}/{totalStalls}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 22}
                          className="fill-muted-foreground text-[10px] tracking-widest uppercase"
                        >
                          Rented
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
      <CardFooter className="text-muted-foreground text-xs">
        {currentMonth} · {rentedRate}% rented
      </CardFooter>
    </Card>
  )
}

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from 'recharts'

import { niceTicks } from '@/lib/format'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

export type ColumnSeries = { key: string; label: string; color: string }

/** The one column chart on the overview: 3-5 gridlines, no y axis line, stacks when given several series. */
export function ColumnChart<T extends { label: string }>({
  data,
  series,
  colorOf,
  ticks,
  formatTick = String,
  formatValue,
  height = 168,
  onSelect,
  bare = false,
}: {
  data: T[]
  series: ColumnSeries[]
  /** Per-column colour for a single series. */
  colorOf?: (datum: T) => string
  ticks?: number[]
  formatTick?: (value: number) => string
  formatValue?: (value: number) => string
  height?: number
  /** Makes each column a control that hands back its datum. */
  onSelect?: (datum: T) => void
  /** Small multiple: month labels only, no value axis or gridlines. */
  bare?: boolean
}) {
  const max = Math.max(
    0,
    ...data.map((datum) =>
      series.reduce(
        (sum, s) =>
          sum + Number((datum as Record<string, unknown>)[s.key] ?? 0),
        0,
      ),
    ),
  )
  const yTicks = ticks ?? niceTicks(Math.max(max, 3))
  const config = Object.fromEntries(
    series.map((s) => [s.key, { label: s.label, color: s.color }]),
  ) satisfies ChartConfig

  return (
    <div className="relative min-w-0 flex-1" style={{ minHeight: height }}>
      <ChartContainer
        config={config}
        className="absolute inset-0 aspect-auto w-full"
      >
        <BarChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          {bare ? null : <CartesianGrid vertical={false} />}
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis
            hide={bare}
            width={36}
            ticks={yTicks}
            domain={[0, yTicks[yTicks.length - 1]]}
            tickFormatter={formatTick}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <ChartTooltip
            cursor={{ fill: 'var(--muted)' }}
            content={
              <ChartTooltipContent
                formatter={
                  formatValue
                    ? (value, name) => (
                        <span className="flex w-full justify-between gap-4">
                          <span className="text-muted-foreground">
                            {config[String(name)]?.label}
                          </span>
                          <span className="font-medium">
                            {formatValue(Number(value))}
                          </span>
                        </span>
                      )
                    : undefined
                }
              />
            }
          />
          {series.map((s, index) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="stack"
              fill={s.color}
              maxBarSize={36}
              className={onSelect ? 'cursor-pointer' : undefined}
              onClick={
                onSelect
                  ? (point: { payload?: T }) =>
                      point.payload && onSelect(point.payload)
                  : undefined
              }
              radius={index === series.length - 1 ? [4, 4, 0, 0] : 0}
            >
              {colorOf
                ? data.map((datum) => (
                    <Cell key={datum.label} fill={colorOf(datum)} />
                  ))
                : null}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>
    </div>
  )
}

export function ChartLegend({ series }: { series: ColumnSeries[] }) {
  return (
    <ul className="type-meta text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
      {series.map((s) => (
        <li key={s.key} className="flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[3px]"
            style={{ background: s.color }}
          />
          {s.label}
        </li>
      ))}
    </ul>
  )
}

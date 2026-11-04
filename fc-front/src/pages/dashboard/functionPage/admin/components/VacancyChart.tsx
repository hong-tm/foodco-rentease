import { fetchCurrentVacancyQueryOptions } from '@/api/stallApi'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChartEmpty } from '@/components/dashboard/ChartEmpty'

import { stallState, type StallState } from './StallsTable'

const FRONT_ROW = 7
const AISLE_PAIRS = 3
const FLOOR_PLAN_SIZE = FRONT_ROW * 2 + AISLE_PAIRS * 2

const CELL: Record<StallState, string> = {
  rented: 'bg-muted text-muted-foreground',
  vacant: 'bg-primary text-primary-foreground',
  ended: 'bg-destructive-soft text-destructive-ink',
}

function Cell({ stall }: { stall: StallUserAttributes }) {
  const state = stallState(stall)
  return (
    <span
      title={`Stall ${stall.stallNumber}: ${state}`}
      className={cn(
        'flex h-11 items-center justify-center rounded-md text-sm font-medium tabular-nums',
        CELL[state],
      )}
    >
      {stall.stallNumber}
    </span>
  )
}

function Key({ tone, label }: { tone: StallState; label: string }) {
  return (
    <li className="flex items-center gap-1.5">
      <span
        aria-hidden="true"
        className={cn('size-3 rounded-sm', CELL[tone])}
      />
      {label}
    </li>
  )
}

// The food court itself, drawn small: the one picture only this product has.
export function VacancyChart() {
  const { data, error } = useQuery(fetchCurrentVacancyQueryOptions)

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Floor plan</CardTitle>
          <CardDescription>Stall status could not be loaded.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const stalls = [...(data?.stalls ?? [])].sort(
    (a, b) => a.stallNumber - b.stallNumber,
  )

  if (stalls.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Floor plan</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartEmpty message="No stalls recorded yet" />
        </CardContent>
      </Card>
    )
  }

  const count = (state: StallState) =>
    stalls.filter((stall) => stallState(stall) === state).length
  const vacant = count('vacant')
  const ended = count('ended')
  const isFloorPlan = stalls.length === FLOOR_PLAN_SIZE

  return (
    <Card>
      <CardHeader>
        <CardTitle>Floor plan</CardTitle>
        <CardDescription>
          {vacant} vacant of {stalls.length} stalls.{' '}
          <Link
            to="/dashboard/stall-availability"
            className="hover:text-foreground -my-3 inline-block py-3 underline underline-offset-4"
          >
            Open the stall board
          </Link>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-7 gap-1.5">
          {isFloorPlan ? (
            <>
              {stalls.slice(0, FRONT_ROW).map((stall) => (
                <Cell key={stall.stallNumber} stall={stall} />
              ))}
              {Array.from({ length: AISLE_PAIRS }, (_, index) => {
                const left = stalls[FRONT_ROW + index * 2]
                const right = stalls[FRONT_ROW + index * 2 + 1]
                return [
                  <Cell key={left.stallNumber} stall={left} />,
                  index === 0 ? (
                    <span
                      key="aisle"
                      className="text-muted-foreground col-span-5 row-span-3 flex items-center justify-center text-xs"
                    >
                      Central aisle
                    </span>
                  ) : null,
                  <Cell key={right.stallNumber} stall={right} />,
                ]
              })}
              {stalls.slice(FLOOR_PLAN_SIZE - FRONT_ROW).map((stall) => (
                <Cell key={stall.stallNumber} stall={stall} />
              ))}
            </>
          ) : (
            stalls.map((stall) => (
              <Cell key={stall.stallNumber} stall={stall} />
            ))
          )}
        </div>
        <ul className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
          <Key tone="vacant" label="Vacant" />
          <Key tone="rented" label="Rented" />
          {ended > 0 ? <Key tone="ended" label="Lease ended" /> : null}
        </ul>
      </CardContent>
    </Card>
  )
}

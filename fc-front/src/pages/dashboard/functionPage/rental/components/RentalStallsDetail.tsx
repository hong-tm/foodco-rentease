import { useSession } from '@/api/adminApi'
import { fetchStallCurrentQueryOptions } from '@/api/stallApi'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { rm } from '@/components/dashboard/monthlyTotals'

function toAmount(value?: string | number | null) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return amount !== undefined && amount !== null && Number.isFinite(amount)
    ? amount
    : 0
}

export type RentalStallsDetailProps = {
  stalls?: StallUserAttributes[]
  isLoading?: boolean
  error?: Error | null
}

export default function RentalStallsDetail({
  stalls: propStalls,
  isLoading: propIsLoading,
  error: propError,
}: RentalStallsDetailProps = {}) {
  const { data: session } = useSession()
  const userId = session?.user?.id

  const {
    data,
    isLoading: queryIsLoading,
    error: queryError,
  } = useQuery({
    ...fetchStallCurrentQueryOptions(userId || ''),
    enabled: propStalls === undefined && Boolean(userId),
  })

  const isLoading = propIsLoading ?? queryIsLoading
  const error = propError ?? queryError
  const stalls = propStalls ?? data?.stalls ?? []

  return (
    <section aria-label="Stalls" className="flex flex-col gap-3">
      <h2 className="type-label text-muted-foreground">Stalls</h2>

      {isLoading ? (
        <div role="status" aria-busy="true" className="flex flex-col gap-2">
          <span className="sr-only">Loading stalls…</span>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : error ? (
        <p className="text-muted-foreground text-sm">
          Stall details could not be loaded.
        </p>
      ) : stalls.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No stall is registered under your account yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border bg-muted/35 border-b hover:bg-transparent">
                <TableHead className="type-label text-muted-foreground">
                  Stall
                </TableHead>
                <TableHead className="type-label text-muted-foreground">
                  Tier · Size
                </TableHead>
                <TableHead className="type-label text-muted-foreground text-right">
                  Monthly Rent
                </TableHead>
                <TableHead className="type-label text-muted-foreground text-right">
                  Lease Period
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stalls.map((stall) => {
                const tierPrice = toAmount(stall.stallTierNumber?.tierPrice)
                const size = toAmount(stall.stallSize)
                const monthlyRent = tierPrice * size
                const start = formatDay(stall.startAt) ?? 'no start date'
                const end = formatDay(stall.endAt) ?? 'no end date'
                return (
                  <TableRow key={stall.stallNumber} className="border-border">
                    <TableCell className="py-3">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">
                          Stall {stall.stallNumber}
                        </span>
                        {stall.stallName ? (
                          <span className="text-muted-foreground text-xs">
                            {stall.stallName}
                          </span>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-sm tabular-nums">
                      {stall.stallTierNumber?.tierName ?? 'No tier'} · {size} m²
                    </TableCell>
                    <TableCell className="py-3 text-right text-sm font-medium tabular-nums">
                      RM {rm(monthlyRent)}
                    </TableCell>
                    <TableCell className="text-muted-foreground py-3 text-right text-sm whitespace-nowrap tabular-nums">
                      {start} – {end}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  )
}

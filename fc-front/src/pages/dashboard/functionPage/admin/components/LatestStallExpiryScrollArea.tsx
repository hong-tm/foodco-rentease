import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { formatDay } from '@/lib/format'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'

export default function LatestStallExpiryScrollArea() {
  const { data: stalls } = useQuery({
    ...fetchStallsQueryOptions,
    select: (data) => {
      const currentDate = new Date()
      return {
        ...data,
        stall: data.stall
          .filter((stall) => new Date(stall.endAt) > currentDate)
          .sort(
            (a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime(),
          ),
      }
    },
  })

  const all = stalls?.stall ?? []
  const visible = all.slice(0, 5)
  const rest = all.length - visible.length

  return (
    <Card className="flex h-full flex-col shadow-none">
      <CardHeader>
        <CardTitle>Rental expiry</CardTitle>
        <CardDescription>Leases ending soonest first</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {visible.length ? (
          <div className="divide-border/60 divide-y">
            {visible.map((stall) => (
              <div
                key={stall.stallNumber}
                className="flex items-center gap-3 py-3"
              >
                <InitialsAvatar
                  name={stall.stallOwnerId?.name ?? 'Unknown'}
                  image={stall.stallOwnerId?.image}
                />
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <p className="truncate text-sm leading-none font-medium">
                    {stall.stallOwnerId?.name ?? 'Unknown tenant'}
                  </p>
                  <p className="text-muted-foreground text-xs tabular-nums">
                    Stall {stall.stallNumber}
                    {stall.stallName ? ` · ${stall.stallName}` : ''}
                  </p>
                </div>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {formatDay(stall.endAt)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-6 text-sm">
            No leases ending.
          </p>
        )}
        {rest > 0 ? (
          <p className="text-muted-foreground text-xs">
            +{rest} more ·{' '}
            <Link
              to="/dashboard/tenant-information"
              className="hover:text-foreground underline underline-offset-4"
            >
              open the full list
            </Link>
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { InitialsAvatar } from '@/components/dashboard/InitialsAvatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'

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

  return (
    <Card className="flex h-full flex-col shadow-none">
      <CardHeader>
        <CardTitle>Rental expiry</CardTitle>
        <CardDescription>Leases ending soonest first</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px]">
          {stalls?.stall.length ? (
            <div className="divide-border/60 divide-y">
              {stalls.stall.map((stall) => (
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
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

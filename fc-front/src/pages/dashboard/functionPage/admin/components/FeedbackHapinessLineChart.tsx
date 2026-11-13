import { getAllFeedbackQueryOptions } from '@/api/feedbackApi'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'

const LOW_AVERAGE = 2.5

/**
 * Ranked bars of average rating, from the same responses as the Feedback page,
 * so both pages show the same number for a stall.
 */
export default function FeedbackHapinessLineChart({
  className,
}: {
  className?: string
}) {
  const { data, isLoading, error, refetch } = useQuery(
    getAllFeedbackQueryOptions,
  )
  const all = data ?? []
  const rows = [...new Set(all.map((feedback) => feedback.stall))]
    .map((stall) => {
      const own = all.filter((feedback) => feedback.stall === stall)
      return {
        stall,
        average:
          own.reduce((sum, feedback) => sum + feedback.happiness, 0) /
          own.length,
      }
    })
    .sort((a, b) => a.average - b.average)
  const lowCount = rows.filter((row) => row.average < LOW_AVERAGE).length
  const shown = rows.slice(0, 5)

  return (
    <Panel className={className}>
      <PanelHeader
        title="Stall happiness"
        meta="Average rating out of 4, lowest first"
        action={
          lowCount ? <Badge variant="negative">{lowCount} low</Badge> : null
        }
      />
      {isLoading ? <PanelRowsSkeleton rows={5} /> : null}
      {error ? (
        <PanelError what="stall happiness" onRetry={() => refetch()} />
      ) : null}
      {data && rows.length === 0 ? (
        <PanelEmpty>No stall has feedback yet.</PanelEmpty>
      ) : null}
      {rows.length > 0 ? (
        <>
          <ul className="flex flex-1 flex-col gap-2">
            {shown.map((row) => {
              const isLow = row.average < LOW_AVERAGE
              return (
                <li
                  key={row.stall}
                  className="type-body grid grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-2"
                >
                  <span className="text-muted-foreground">
                    Stall {row.stall}
                  </span>
                  <span className="bg-muted h-2 overflow-hidden rounded-full">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${(row.average / 4) * 100}%`,
                        background: isLow
                          ? 'var(--destructive)'
                          : 'var(--chart-1)',
                      }}
                    />
                  </span>
                  <span
                    className={cn(
                      'text-right font-medium tabular-nums',
                      isLow && 'text-negative-ink',
                    )}
                  >
                    {row.average.toFixed(1)}
                  </span>
                </li>
              )
            })}
          </ul>
          <p className="type-meta text-muted-foreground flex justify-between gap-3">
            <span>
              {rows.length > shown.length
                ? `Lowest ${shown.length} of ${rows.length} stalls`
                : `${rows.length} stalls`}
            </span>
            <Button variant="quiet" asChild>
              <Link to="/dashboard/feedback">Read feedback</Link>
            </Button>
          </p>
        </>
      ) : null}
    </Panel>
  )
}

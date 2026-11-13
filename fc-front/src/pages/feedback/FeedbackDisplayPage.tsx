import { Fragment, useState } from 'react'
import {
  deleteFeedback,
  feedbacksQueryKey,
  getAllFeedbackQueryOptions,
  type Feedback,
} from '@/api/feedbackApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useQuery } from '@tanstack/react-query'
import {
  AngryIcon,
  FrownIcon,
  LaughIcon,
  SmileIcon,
  Trash2Icon,
  type LucideIcon,
} from 'lucide-react'

import { formatDay } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useDeferredAction } from '@/hooks/use-deferred-action'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PageHeader } from '@/components/dashboard/PageHeader'

// Five columns split 10 / 14 / 14 / 50 / 12. The comment takes the slack; the
// action share is the delete control plus its cell padding. Ratios belong to
// this table, so they stay page-scoped instead of becoming theme tokens.
const COLUMN_WIDTH = {
  date: '10%',
  stall: '14%',
  rating: '14%',
  comment: '50%',
  action: '12%',
} as const

type RatingMeta = {
  value: number
  label: string
  Icon: LucideIcon
  text: string
  bar: string
}

const RATINGS: RatingMeta[] = [
  {
    value: 4,
    label: 'Very happy',
    Icon: LaughIcon,
    text: 'text-success-ink hover:text-success-ink',
    bar: 'bg-success',
  },
  {
    value: 3,
    label: 'Happy',
    Icon: SmileIcon,
    text: 'text-foreground hover:text-foreground',
    bar: 'bg-success-ink',
  },
  {
    value: 2,
    label: 'Unhappy',
    Icon: FrownIcon,
    text: 'text-warning-ink hover:text-warning-ink',
    bar: 'bg-warning',
  },
  {
    value: 1,
    label: 'Very unhappy',
    Icon: AngryIcon,
    text: 'text-destructive hover:text-destructive',
    bar: 'bg-destructive',
  },
]

type RatingCount = RatingMeta & { count: number }

const GROUPS = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'earlier', label: 'Earlier' },
] as const

type GroupKey = (typeof GROUPS)[number]['key']

function ratingOf(value: number) {
  return RATINGS.find((rating) => rating.value === value) ?? null
}

// A row lands in the newest bucket its date reaches: the running week (Monday
// start), then the running month, then everything older.
function groupOf(value: string): GroupKey {
  const date = new Date(value)
  const now = new Date()
  const mondayOffset = (now.getDay() + 6) % 7
  const weekStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - mondayOffset,
  )
  if (date >= weekStart) return 'week'
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth()
  ) {
    return 'month'
  }
  return 'earlier'
}

// Sentiment needs no action when it is already positive, or when the customer
// left no message to act on; those rows recede so the complaints carry the
// page. Rating and message are the whole record, so the rule is derivable.
function isLowPriority(feedback: Feedback) {
  return feedback.happiness >= 3 || feedback.feedbackContent.trim().length === 0
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Feedback"
        description="What customers said about each stall. Delete entries that are spam or abuse."
      />
      {children}
    </div>
  )
}

function DistributionBar({
  counts,
  total,
}: {
  counts: RatingCount[]
  total: number
}) {
  const shares = counts.filter((rating) => rating.count > 0)
  const summary = shares
    .map((rating) => `${rating.label} ${rating.count}`)
    .join(', ')

  return (
    <div
      role="img"
      aria-label={`Rating distribution across ${total} ${
        total === 1 ? 'comment' : 'comments'
      }: ${summary}`}
      className="bg-muted flex h-2 w-full gap-px overflow-hidden rounded-full"
    >
      {shares.map((rating) => (
        <span
          key={rating.value}
          aria-hidden="true"
          className={cn('h-full', rating.bar)}
          style={{ flexGrow: rating.count }}
        />
      ))}
    </div>
  )
}

const FILTER_ITEM =
  'hover:bg-card/60 flex-none rounded-md border-t-2 border-transparent px-3 data-[state=on]:border-primary data-[state=on]:bg-card max-sm:h-auto max-sm:justify-start max-sm:gap-1 max-sm:px-2 max-sm:py-1.5 max-sm:whitespace-normal'

export function FeedbackDisplayPage() {
  const { data, error, isPending, refetch } = useQuery(
    getAllFeedbackQueryOptions,
  )
  const { data: stallsData } = useQuery(fetchStallsQueryOptions)
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)

  const stallName = (stallNumber: number) =>
    stallsData?.stall.find((stall) => stall.stallNumber === stallNumber)
      ?.stallName ?? 'Name not recorded'

  if (isPending) {
    return (
      <Shell>
        <div
          role="status"
          aria-live="polite"
          className="border-border flex flex-col gap-5 rounded-xl border p-6"
        >
          <span className="sr-only">Loading feedback…</span>
          {[0, 1, 2, 3, 4].map((row) => (
            <div
              key={row}
              className="flex items-center gap-4"
              aria-hidden="true"
            >
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </Shell>
    )
  }

  if (error) {
    return (
      <Shell>
        <div
          role="alert"
          className="border-destructive/40 bg-destructive/5 flex flex-col items-start gap-3 rounded-xl border p-5 text-sm"
        >
          <p>Feedback could not be loaded: {error.message}</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </Shell>
    )
  }

  const feedbacks = data ?? []

  if (feedbacks.length === 0) {
    return (
      <Shell>
        <p className="text-muted-foreground text-sm">
          No feedback has been submitted yet.
        </p>
      </Shell>
    )
  }

  const counts: RatingCount[] = RATINGS.map((rating) => ({
    ...rating,
    count: feedbacks.filter((feedback) => feedback.happiness === rating.value)
      .length,
  }))

  const visible =
    ratingFilter === null
      ? feedbacks
      : feedbacks.filter((feedback) => feedback.happiness === ratingFilter)

  const ordered = visible
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )

  const sections = GROUPS.map((group) => ({
    ...group,
    rows: ordered.filter(
      (feedback) => groupOf(feedback.createdAt) === group.key,
    ),
  })).filter((section) => section.rows.length > 0)

  const activeLabel = ratingFilter === null ? null : ratingOf(ratingFilter)

  return (
    <Shell>
      <section
        aria-label="Rating breakdown"
        className="bg-card border-border flex flex-col gap-4 rounded-xl border px-6 py-5"
      >
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <p className="flex items-baseline gap-2">
            <span className="type-section-title tabular-nums">
              {feedbacks.length}
            </span>
            <span className="text-muted-foreground text-sm">
              {feedbacks.length === 1 ? 'comment' : 'comments'}
            </span>
          </p>
          {activeLabel ? (
            <p className="text-muted-foreground text-sm tabular-nums">
              Showing {visible.length} of {feedbacks.length}
            </p>
          ) : null}
        </div>

        <DistributionBar counts={counts} total={feedbacks.length} />

        <ToggleGroup
          type="single"
          value={ratingFilter === null ? 'all' : String(ratingFilter)}
          onValueChange={(next) => {
            if (!next || next === 'all') {
              setRatingFilter(null)
              return
            }
            setRatingFilter(Number(next))
          }}
          aria-label="Filter feedback by rating"
          className="bg-muted/40 border-border grid w-full grid-cols-2 gap-1 rounded-lg border p-1 sm:flex sm:w-fit sm:flex-wrap"
        >
          <ToggleGroupItem
            value="all"
            aria-label={`All ratings (${feedbacks.length})`}
            className={cn(FILTER_ITEM, 'max-sm:col-span-2')}
          >
            <span className="text-sm">All</span>
            <span className="text-sm font-medium tabular-nums">
              ({feedbacks.length})
            </span>
          </ToggleGroupItem>
          {counts.map((rating) => (
            <ToggleGroupItem
              key={rating.value}
              value={String(rating.value)}
              disabled={rating.count === 0}
              aria-label={`${rating.label} (${rating.count})`}
              className={cn(FILTER_ITEM, rating.text)}
            >
              <rating.Icon className="size-4" aria-hidden="true" />
              <span className="text-sm">{rating.label}</span>
              <span className="text-sm font-medium tabular-nums">
                ({rating.count})
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>

      <div className="border-border bg-card max-w-full min-w-0 overflow-hidden rounded-xl border">
        <Table className="xl:min-w-table">
          <TableCaption className="sr-only">
            Customer feedback with date, stall, rating and comment
          </TableCaption>
          <TableHeader className="border-border border-b max-xl:sr-only">
            <TableRow className="hover:bg-transparent">
              <TableHead
                className={`type-label text-muted-foreground h-12 pl-6`}
                style={{ width: COLUMN_WIDTH.date }}
              >
                Date
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.stall }}
              >
                Stall
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.rating }}
              >
                Rating
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 xl:table-cell`}
                style={{ width: COLUMN_WIDTH.comment }}
              >
                Comment
              </TableHead>
              <TableHead
                className={`type-label text-muted-foreground hidden h-12 pr-6 text-right xl:table-cell`}
                style={{ width: COLUMN_WIDTH.action }}
              >
                Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sections.map((section) => (
              <Fragment key={section.key}>
                <TableRow className="border-border hover:bg-transparent">
                  <TableCell colSpan={5} className="bg-muted/40 px-6 py-2">
                    <span className="type-label text-muted-foreground flex items-baseline justify-between uppercase">
                      <span>{section.label}</span>
                      <span className="tabular-nums">
                        {section.rows.length}
                      </span>
                    </span>
                  </TableCell>
                </TableRow>
                {section.rows.map((feedback) => (
                  <FeedbackRow
                    key={feedback.id}
                    feedback={feedback}
                    stallName={stallName(feedback.stall)}
                  />
                ))}
              </Fragment>
            ))}
            {sections.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={5}
                  className="text-muted-foreground px-6 py-6 text-sm"
                >
                  {activeLabel
                    ? `No ${activeLabel.label.toLowerCase()} feedback to show.`
                    : 'No feedback to show.'}
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </Shell>
  )
}

function Rating({ happiness }: { happiness: number }) {
  const rating = ratingOf(happiness)
  if (!rating) {
    return <span className="text-muted-foreground text-xs">No rating</span>
  }
  // The icon carries the band's colour so the column can be scanned by
  // sentiment; the label stays neutral (chromatic data, neutral chrome).
  return (
    <span className="flex items-center gap-2">
      <rating.Icon className={cn('size-4', rating.text)} aria-hidden="true" />
      <span className="text-sm">{rating.label}</span>
    </span>
  )
}

function FeedbackRow({
  feedback,
  stallName,
}: {
  feedback: Feedback
  stallName: string
}) {
  const deferred = useDeferredAction()

  const handleDelete = () =>
    deferred.remove<Feedback>({
      queryKey: feedbacksQueryKey.feedbacks(),
      invalidateKey: feedbacksQueryKey.all,
      matches: (row) => row.id === feedback.id,
      commit: () => deleteFeedback({ id: feedback.id }),
      pendingTitle: 'Feedback deleted',
      successTitle: `Feedback ${feedback.id} deleted`,
      errorTitle: `Failed to delete feedback ${feedback.id}`,
    })

  const deleteButton = (className: string) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className={`text-muted-foreground hover:text-destructive -ml-2 px-2 ${className}`}
    >
      <Trash2Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">Delete this feedback</span>
    </Button>
  )

  // DESIGN.md: icon-only buttons carry a tooltip that teaches the function.
  const deleteButtonWithTooltip = (className: string) => (
    <Tooltip>
      <TooltipTrigger asChild>{deleteButton(className)}</TooltipTrigger>
      <TooltipContent>Delete this feedback</TooltipContent>
    </Tooltip>
  )

  return (
    <TableRow
      className={cn(
        'border-border hover:bg-muted/30',
        isLowPriority(feedback) && 'bg-muted/20 text-muted-foreground',
      )}
    >
      <TableCell className="py-4 pl-6 align-baseline whitespace-normal">
        <span className="text-sm whitespace-nowrap tabular-nums">
          {formatDay(feedback.createdAt)}
        </span>

        <div className="mt-2 flex flex-col gap-2 xl:hidden">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-sm font-medium tabular-nums">
              Stall {feedback.stall}
            </span>
            <span className="text-muted-foreground text-xs">{stallName}</span>
            <Rating happiness={feedback.happiness} />
          </div>
          <p className="text-sm break-words whitespace-pre-wrap">
            {feedback.feedbackContent || (
              <span className="text-muted-foreground">No message</span>
            )}
          </p>
          <div>{deleteButtonWithTooltip('xl:hidden')}</div>
        </div>
      </TableCell>

      <TableCell className="hidden py-4 align-baseline whitespace-normal xl:table-cell">
        <p className="text-sm font-medium tabular-nums">
          Stall {feedback.stall}
        </p>
        <p className="text-muted-foreground mt-1 text-xs">{stallName}</p>
      </TableCell>

      <TableCell className="hidden py-4 align-baseline xl:table-cell">
        <Rating happiness={feedback.happiness} />
      </TableCell>

      <TableCell className="hidden py-4 align-baseline whitespace-normal xl:table-cell">
        <p className="text-sm break-words whitespace-pre-wrap">
          {feedback.feedbackContent || (
            <span className="text-muted-foreground">No message</span>
          )}
        </p>
      </TableCell>

      <TableCell className="hidden py-4 pr-6 text-right align-baseline xl:table-cell">
        {deleteButtonWithTooltip('hidden xl:inline-flex')}
      </TableCell>
    </TableRow>
  )
}

export default FeedbackDisplayPage

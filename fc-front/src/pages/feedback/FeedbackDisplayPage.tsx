import { useState } from 'react'
import {
  deleteFeedback,
  feedbacksQueryKey,
  getAllFeedbackQueryOptions,
  removeFeedbackById,
  type Feedback,
} from '@/api/feedbackApi'
import { fetchStallsQueryOptions } from '@/api/stallApi'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2Icon, Trash2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { formatDay } from '@/lib/format'
import { cn } from '@/lib/utils'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
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
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SummaryLine } from '@/components/dashboard/SpecStrip'

import { RATINGS } from './ratings'

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

function ratingOf(value: number) {
  return RATINGS.find((rating) => rating.value === value) ?? null
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

export function FeedbackDisplayPage() {
  const { data, error, isPending, refetch } = useQuery(
    getAllFeedbackQueryOptions,
  )
  const { data: stallsData } = useQuery(fetchStallsQueryOptions)
  const queryClient = useQueryClient()

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

  const counts = RATINGS.map((rating) => ({
    ...rating,
    count: feedbacks.filter((feedback) => feedback.happiness === rating.value)
      .length,
  }))

  return (
    <Shell>
      <section aria-label="Rating breakdown">
        <SummaryLine
          value={String(feedbacks.length)}
          unit={feedbacks.length === 1 ? 'comment' : 'comments'}
          cells={counts.map(({ value, label, count }) => ({
            label,
            value: count,
            tone:
              value === 4
                ? 'success'
                : value === 3
                  ? 'muted'
                  : value === 2
                    ? 'warning'
                    : 'destructive',
          }))}
        />
      </section>

      <div className="max-w-full min-w-0 overflow-hidden">
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
            {feedbacks.map((feedback) => (
              <FeedbackRow
                key={feedback.id}
                feedback={feedback}
                stallName={stallName(feedback.stall)}
                onDeleted={() => {
                  queryClient.setQueryData<Feedback[]>(
                    feedbacksQueryKey.feedbacks(),
                    (oldData) => removeFeedbackById(oldData, feedback.id),
                  )
                }}
              />
            ))}
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
  const tone =
    rating.value === 4
      ? 'text-success-ink'
      : rating.value === 3
        ? 'text-foreground'
        : rating.value === 2
          ? 'text-warning-ink'
          : 'text-destructive'
  return (
    <span className="flex items-center gap-2">
      <rating.Icon className={cn('size-4', tone)} aria-hidden="true" />
      <span className="text-sm">{rating.label}</span>
    </span>
  )
}

function FeedbackRow({
  feedback,
  stallName,
  onDeleted,
}: {
  feedback: Feedback
  stallName: string
  onDeleted: () => void
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const trigger = (className: string) => (
    <AlertDialogTrigger asChild>
      <Button
        variant="ghost"
        size="sm"
        className={`text-muted-foreground hover:text-destructive -ml-2 px-2 ${className}`}
      >
        <Trash2Icon className="size-4" aria-hidden="true" />
        <span className="sr-only">Delete this feedback</span>
      </Button>
    </AlertDialogTrigger>
  )

  return (
    <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <TableRow className="border-border/60 hover:bg-muted/30">
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
            <div>{trigger('xl:hidden')}</div>
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
          {trigger('hidden xl:inline-flex')}
        </TableCell>
      </TableRow>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete feedback #{feedback.id}?</AlertDialogTitle>
          <AlertDialogDescription>
            {feedback.feedbackContent
              ? `"${feedback.feedbackContent.slice(0, 120)}${
                  feedback.feedbackContent.length > 120 ? '…' : ''
                }"`
              : 'This entry has no message.'}{' '}
            It is removed for good and cannot be restored.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <FeedbackDeleteButton
              id={feedback.id}
              onSuccess={() => {
                setIsDialogOpen(false)
                onDeleted()
              }}
            />
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function FeedbackDeleteButton({
  id,
  onSuccess,
}: {
  id: number
  onSuccess: () => void
}) {
  const mutation = useMutation({
    mutationFn: deleteFeedback,
    onError: () => {
      toast.error(`Failed to delete feedback ${id}`)
    },
    onSuccess: () => {
      toast.success(`Feedback ${id} deleted`)
      onSuccess()
    },
  })

  return (
    <Button
      onClick={() => mutation.mutate({ id })}
      disabled={mutation.isPending}
      variant="destructive"
    >
      {mutation.isPending ? (
        <>
          Deleting
          <Loader2Icon className="size-4 animate-spin" />
        </>
      ) : (
        'Delete'
      )}
    </Button>
  )
}

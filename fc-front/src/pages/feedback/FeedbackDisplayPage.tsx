import { useState, type MouseEvent } from 'react'
import {
  deleteFeedback,
  feedbacksQueryKey,
  getAllFeedbackQueryOptions,
  removeFeedbackById,
  type Feedback,
} from '@/api/feedbackApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AngryIcon,
  FrownIcon,
  LaughIcon,
  SmileIcon,
  Trash2Icon,
} from 'lucide-react'
import { toast } from 'sonner'

import { formatDate } from '@/lib/format'
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item'
import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelHeader,
  PanelRowsSkeleton,
} from '@/components/ui/panel'
import {
  PanelToolbar,
  SearchField,
  TablePager,
  TablePanel,
  usePager,
} from '@/components/ui/panel-parts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const mood: Record<
  Feedback['happiness'],
  { label: string; icon: typeof LaughIcon; tone: string; bar: string }
> = {
  4: {
    label: 'Very happy',
    icon: LaughIcon,
    tone: 'bg-positive-soft text-positive-ink',
    bar: 'var(--positive)',
  },
  3: {
    label: 'Happy',
    icon: SmileIcon,
    tone: 'bg-muted text-muted-foreground',
    bar: 'var(--chart-1-soft)',
  },
  2: {
    label: 'Unhappy',
    icon: FrownIcon,
    tone: 'bg-warning-soft text-warning-ink',
    bar: 'var(--chart-3)',
  },
  1: {
    label: 'Angry',
    icon: AngryIcon,
    tone: 'bg-negative-soft text-negative-ink',
    bar: 'var(--destructive)',
  },
}
const levels = [4, 3, 2, 1] as const

type Sort = 'new' | 'low'

export function FeedbackDisplayPage() {
  const { data, error, isPending, refetch } = useQuery(
    getAllFeedbackQueryOptions,
  )
  const [level, setLevel] = useState('all')
  const [stall, setStall] = useState('all')
  const [sort, setSort] = useState<Sort>('new')
  const [search, setSearch] = useState('')

  const all = data ?? []
  const countOf = (happiness: number) =>
    all.filter((feedback) => feedback.happiness === happiness).length
  const average = all.length
    ? all.reduce((sum, feedback) => sum + feedback.happiness, 0) / all.length
    : 0
  const unhappy = countOf(1) + countOf(2)

  const stalls = [...new Set(all.map((feedback) => feedback.stall))].sort(
    (a, b) => a - b,
  )
  const ranking = stalls
    .map((number) => {
      const own = all.filter((feedback) => feedback.stall === number)
      return {
        number,
        count: own.length,
        average: own.reduce((sum, f) => sum + f.happiness, 0) / own.length,
      }
    })
    .sort((a, b) => a.average - b.average || a.number - b.number)

  const query = search.trim().toLowerCase()
  const rows = all
    .filter(
      (feedback) =>
        (level === 'all' || String(feedback.happiness) === level) &&
        (stall === 'all' || String(feedback.stall) === stall) &&
        (!query || feedback.feedbackContent?.toLowerCase().includes(query)),
    )
    .sort((a, b) =>
      sort === 'low' && a.happiness !== b.happiness
        ? a.happiness - b.happiness
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
  const pager = usePager(rows, 12, `${level}|${stall}|${sort}|${query}`)

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Feedback">
        {data
          ? `${all.length} responses across ${stalls.length} stalls, averaging ${average.toFixed(1)} out of 4. ${unhappy} ${unhappy === 1 ? 'is' : 'are'} unhappy.`
          : 'What customers say about each stall.'}
      </PageHeader>

      {error ? (
        <Panel>
          <PanelError what="feedback" onRetry={() => refetch()} />
        </Panel>
      ) : null}

      {!error ? (
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <TablePanel>
            <PanelToolbar>
              <ToggleGroup
                type="single"
                variant="outline"
                value={level}
                onValueChange={(next) => setLevel(next || 'all')}
                aria-label="Filter by rating"
                className="max-md:w-full"
              >
                <ToggleGroupItem value="all" className="px-3 max-md:h-11">
                  All
                </ToggleGroupItem>
                {levels.map((value) => {
                  const Icon = mood[value].icon
                  return (
                    <ToggleGroupItem
                      key={value}
                      value={String(value)}
                      aria-label={`${mood[value].label}, ${countOf(value)}`}
                      title={mood[value].label}
                      className="gap-1.5 px-2.5 max-md:h-11"
                    >
                      <Icon />
                      <span className="tabular-nums">{countOf(value)}</span>
                    </ToggleGroupItem>
                  )
                })}
              </ToggleGroup>
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Search comments"
                label="Search comments"
                className="md:w-52"
              />
              <div className="flex gap-2 max-md:w-full md:ml-auto">
                <Select value={stall} onValueChange={setStall}>
                  <SelectTrigger
                    aria-label="Filter by stall"
                    className="w-32 max-md:h-11 max-md:flex-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All stalls</SelectItem>
                    {stalls.map((number) => (
                      <SelectItem key={number} value={String(number)}>
                        Stall {number}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sort}
                  onValueChange={(value) => setSort(value as Sort)}
                >
                  <SelectTrigger
                    aria-label="Sort feedback"
                    className="w-36 max-md:h-11 max-md:flex-1"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Newest first</SelectItem>
                    <SelectItem value="low">Lowest rating</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </PanelToolbar>
            {isPending ? (
              <div className="p-4 md:p-5">
                <PanelRowsSkeleton rows={6} />
              </div>
            ) : null}
            {data && pager.total === 0 ? (
              <p className="type-body text-muted-foreground px-4 py-8 text-center">
                No feedback matches these filters.
              </p>
            ) : null}
            {pager.total > 0 ? (
              <ul className="divide-y">
                {pager.rows.map((feedback) => (
                  <li key={feedback.id}>
                    <FeedbackRow feedback={feedback} />
                  </li>
                ))}
              </ul>
            ) : null}
            {data ? <TablePager pager={pager} noun="responses" /> : null}
          </TablePanel>

          <div className="flex flex-col gap-4 xl:sticky xl:top-16 xl:max-h-[calc(100svh-5rem)] xl:overflow-y-auto xl:overscroll-contain xl:[scrollbar-width:thin]">
            <Panel>
              <PanelHeader title="Ratings" meta="Share of all responses" />
              {all.length === 0 && data ? (
                <PanelEmpty>No feedback yet.</PanelEmpty>
              ) : null}
              <div
                aria-hidden="true"
                className="flex h-2 gap-0.5 overflow-hidden rounded-full"
              >
                {levels.map((value) =>
                  countOf(value) ? (
                    <span
                      key={value}
                      style={{
                        flexGrow: countOf(value),
                        background: mood[value].bar,
                      }}
                    />
                  ) : null,
                )}
              </div>
              <ul className="flex flex-col gap-1">
                {levels.map((value) => (
                  <li key={value} className="type-body flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="size-2 rounded-full"
                      style={{ background: mood[value].bar }}
                    />
                    <span className="text-muted-foreground flex-1">
                      {mood[value].label}
                    </span>
                    <span className="font-medium tabular-nums">
                      {countOf(value)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel>
              <PanelHeader title="By stall" meta="Lowest average first" />
              <ul className="-mx-2 flex flex-col">
                {ranking.map((row) => {
                  const selected = stall === String(row.number)
                  return (
                    <li key={row.number}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() =>
                          setStall(selected ? 'all' : String(row.number))
                        }
                        className={cn(
                          'type-body focus-visible:ring-ring grid min-h-11 w-full cursor-pointer grid-cols-[56px_minmax(0,1fr)_28px] items-center gap-2 rounded-md px-2 text-left outline-none focus-visible:ring-2 md:min-h-8',
                          selected ? 'bg-brand-soft' : 'hover:bg-accent',
                        )}
                      >
                        <span className="text-muted-foreground">
                          Stall {row.number}
                        </span>
                        <span className="bg-muted h-1.5 overflow-hidden rounded-full">
                          <span
                            className="block h-full rounded-full"
                            style={{
                              width: `${(row.average / 4) * 100}%`,
                              background:
                                row.average < 2.5
                                  ? 'var(--destructive)'
                                  : 'var(--chart-1)',
                            }}
                          />
                        </span>
                        <span
                          className={cn(
                            'text-right font-medium tabular-nums',
                            row.average < 2.5 && 'text-negative-ink',
                          )}
                        >
                          {row.average.toFixed(1)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </Panel>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FeedbackRow({ feedback }: { feedback: Feedback }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const rating = mood[feedback.happiness]
  const Icon = rating.icon

  return (
    <Item className="items-start rounded-none border-0 px-4 py-3 md:px-5">
      <ItemMedia
        className={cn('size-8 rounded-full', rating.tone)}
        title={rating.label}
        aria-label={rating.label}
      >
        <Icon className="size-4" />
      </ItemMedia>
      <ItemContent className="min-w-0 gap-1">
        <ItemTitle className="type-meta text-muted-foreground w-full font-normal">
          <span className="text-foreground font-medium">
            Stall {feedback.stall}
          </span>
          <span>{formatDate(feedback.createdAt)}</span>
          <span className="type-id">#{feedback.id}</span>
        </ItemTitle>
        <ItemDescription
          className={cn(
            'type-body line-clamp-none break-words',
            feedback.feedbackContent ? 'text-foreground' : 'italic',
          )}
        >
          {feedback.feedbackContent || 'No comment left.'}
        </ItemDescription>
      </ItemContent>
      <ItemActions>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete feedback ${feedback.id}`}
              className="text-muted-foreground hover:text-destructive size-8 max-md:size-11"
            >
              <Trash2Icon className="size-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete feedback {feedback.id}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This removes it for good. Stall {feedback.stall} loses this
                rating from its average.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Keep</AlertDialogCancel>
              <AlertDialogAction asChild>
                <FeedbackDeleteButton
                  id={feedback.id}
                  onSuccess={() => setIsDialogOpen(false)}
                />
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </ItemActions>
    </Item>
  )
}

// Gmail-style delete: the row disappears immediately, a toast offers
// Undo for a short window; the server DELETE only fires after the window
// closes without an undo. Undoing restores the row and cancels the call.
const UNDO_WINDOW_MS = 5_000

function FeedbackDeleteButton({
  id,
  onSuccess,
}: {
  id: number
  onSuccess: () => void
}) {
  const queryClient = useQueryClient()

  function removeOptimistically() {
    const snapshot = queryClient.getQueryData<Feedback[]>(
      feedbacksQueryKey.feedbacks(),
    )
    queryClient.setQueryData<Feedback[]>(feedbacksQueryKey.feedbacks(), (old) =>
      removeFeedbackById(old, id),
    )
    return snapshot
  }

  function restore(snapshot: Feedback[] | undefined) {
    queryClient.setQueryData<Feedback[]>(
      feedbacksQueryKey.feedbacks(),
      snapshot,
    )
  }

  async function persistDelete() {
    try {
      await deleteFeedback({ id })
    } catch {
      toast.error(`Failed to delete feedback ${id}`)
    } finally {
      // Refetch either way: on success to settle the list, on failure to
      // restore the row the optimistic delete removed.
      await queryClient.invalidateQueries({ queryKey: feedbacksQueryKey.all })
    }
  }

  function handleDelete(event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault()
    const snapshot = removeOptimistically()
    onSuccess()

    let undone = false
    toast('Feedback deleted', {
      duration: UNDO_WINDOW_MS,
      action: {
        label: 'Undo',
        onClick: () => {
          undone = true
          restore(snapshot)
        },
      },
    })

    window.setTimeout(() => {
      if (!undone) void persistDelete()
    }, UNDO_WINDOW_MS + 50)
  }

  return (
    <Button variant="destructive" onClick={handleDelete}>
      Delete
    </Button>
  )
}

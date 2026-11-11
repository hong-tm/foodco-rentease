import * as React from 'react'
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

/** A table on the page: one surface, toolbar on top, rows edge to edge. */
export function TablePanel({
  className,
  ...props
}: React.ComponentProps<'section'>) {
  return (
    <section
      data-slot="panel"
      className={cn(
        'bg-card text-card-foreground flex min-w-0 flex-col overflow-clip rounded-xl border',
        '[&_[data-slot=table-container]]:overflow-x-auto [&_td:first-child]:pl-4 md:[&_td:first-child]:pl-5 [&_td:last-child]:pr-4 md:[&_td:last-child]:pr-5 [&_th:first-child]:pl-4 md:[&_th:first-child]:pl-5 [&_th:last-child]:pr-4 md:[&_th:last-child]:pr-5',
        className,
      )}
      {...props}
    />
  )
}

export function PanelToolbar({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-2 border-b px-4 py-3 md:px-5',
        className,
      )}
      {...props}
    />
  )
}

/** View switch with counts, the same control on every list. */
export function CountTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  className,
}: {
  tabs: { value: T; label: React.ReactNode; count?: number }[]
  value: T
  onChange: (value: T) => void
  label: string
  className?: string
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(next) => onChange(next as T)}
      className={cn('min-w-0 max-md:w-full', className)}
    >
      <div>
        <TabsList
          aria-label={label}
          className="max-md:h-auto max-md:min-h-11 max-md:flex-wrap max-md:justify-start"
        >
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="px-2.5 max-md:h-11 max-md:flex-none"
            >
              {tab.label}
              {tab.count !== undefined ? (
                <span className="type-meta text-muted-foreground tabular-nums">
                  {tab.count}
                </span>
              ) : null}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  )
}

export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  className,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  label: string
  className?: string
}) {
  return (
    <InputGroup className={cn('bg-card w-full max-md:h-11 md:w-64', className)}>
      <InputGroupAddon>
        <SearchIcon />
      </InputGroupAddon>
      <InputGroupInput
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={label}
      />
    </InputGroup>
  )
}

/**
 * Slice a list into pages. Pass a `resetKey` built from the active filters: when
 * it changes the pager goes back to the first page, so a new filter result never
 * opens on the middle page of a shorter list.
 */
export function usePager<T>(items: T[], size = 15, resetKey?: string | number) {
  const [state, setState] = React.useState({ key: resetKey, page: 0 })
  // Derive the page during render: a key that arrived with this render starts at 0.
  const page = state.key === resetKey ? state.page : 0
  const setPage = (next: number) => setState({ key: resetKey, page: next })
  const pages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(page, pages - 1)
  return {
    rows: items.slice(current * size, (current + 1) * size),
    page: current,
    pages,
    size,
    total: items.length,
    setPage,
  }
}

export function TablePager({
  pager,
  noun,
}: {
  pager: ReturnType<typeof usePager<unknown>>
  noun: string
}) {
  const { page, pages, size, total, setPage } = pager
  const first = total === 0 ? 0 : page * size + 1
  const last = Math.min(total, (page + 1) * size)
  return (
    <div className="flex items-center justify-between gap-3 border-t px-4 py-2.5 md:px-5">
      <p className="type-meta text-muted-foreground tabular-nums">
        {pages > 1
          ? `${first}–${last} of ${total} ${noun}`
          : `${total} ${noun}`}
      </p>
      {pages > 1 ? (
        <ButtonGroup aria-label="Pages">
          <Button
            variant="outline"
            size="icon"
            className="size-8 max-md:size-11"
            aria-label="Previous page"
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="size-8 max-md:size-11"
            aria-label="Next page"
            disabled={page >= pages - 1}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon />
          </Button>
        </ButtonGroup>
      ) : null}
    </div>
  )
}

/** A row of figures on one surface, split by hairlines rather than cards. */
export function StatStrip({
  stats,
  className,
}: {
  stats: {
    label: string
    value: React.ReactNode
    note?: React.ReactNode
    tone?: 'negative'
    /** Makes the figure a shortcut to the rows behind it. */
    onSelect?: () => void
    selected?: boolean
  }[]
  className?: string
}) {
  return (
    <dl
      className={cn(
        'bg-card grid grid-cols-2 overflow-hidden rounded-xl border md:auto-cols-fr md:grid-flow-col md:grid-cols-none',
        className,
      )}
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={cn(
            'relative flex min-w-0 flex-col gap-0.5 border-b p-4 last:border-b-0 even:border-l md:border-b-0 md:not-first:border-l md:even:border-l',
            stat.onSelect && 'hover:bg-accent/60 cursor-pointer',
            stat.selected && 'bg-brand-soft hover:bg-brand-soft',
          )}
        >
          {stat.onSelect ? (
            <button
              type="button"
              aria-pressed={stat.selected}
              aria-label={`${stat.label}: show these records`}
              onClick={stat.onSelect}
              className="focus-visible:ring-ring absolute inset-0 rounded-none outline-none focus-visible:ring-2 focus-visible:ring-inset"
            />
          ) : null}
          <dt className="type-meta text-muted-foreground">{stat.label}</dt>
          <dd
            className={cn(
              'type-figure truncate',
              stat.tone === 'negative' && 'text-negative-ink',
            )}
          >
            {stat.value}
          </dd>
          {stat.note ? (
            <dd className="type-meta text-muted-foreground truncate">
              {stat.note}
            </dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}

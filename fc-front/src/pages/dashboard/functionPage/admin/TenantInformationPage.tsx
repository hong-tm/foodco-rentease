import { useMemo, useState } from 'react'
import { fetchRentalsQueryOptions } from '@/api/adminApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useSearch } from '@tanstack/react-router'

import {
  ENDING_SOON_DAYS,
  byEndDate,
  leaseState,
  type LeaseState,
} from '@/lib/stall-lease'
import { cn } from '@/lib/utils'

import {
  Panel,
  PanelEmpty,
  PanelError,
  PanelRowsSkeleton,
} from '@/components/ui/panel'
import {
  CountTabs,
  PanelToolbar,
  SearchField,
  TablePanel,
} from '@/components/ui/panel-parts'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonAvatar } from '@/components/person-avatar'

import RentalsTable, { type RentalRow } from './components/RentalsTable'

type View = 'all' | 'attention' | Exclude<LeaseState, 'free'>
type Sort = 'end' | 'tenant' | 'stall'

const views: View[] = ['all', 'attention', 'past', 'ending', 'let']

const inView = (stall: RentalRow['stall'], view: View) => {
  const state = leaseState(stall)
  if (view === 'all') return true
  if (view === 'attention') return state === 'past' || state === 'ending'
  return state === view
}

const sorters: Record<Sort, (a: RentalRow, b: RentalRow) => number> = {
  end: (a, b) => byEndDate(a.stall, b.stall),
  tenant: (a, b) =>
    a.user.name.localeCompare(b.user.name) ||
    a.stall.stallNumber - b.stall.stallNumber,
  stall: (a, b) => a.stall.stallNumber - b.stall.stallNumber,
}

export function TenantInformationPage() {
  const { data, isLoading, error, refetch } = useQuery(fetchRentalsQueryOptions)
  const { view: requested } = useSearch({
    from: '/dashboard/tenant-information',
  })
  const navigate = useNavigate({ from: '/dashboard/tenant-information' })
  const [search, setSearch] = useState('')
  const [tenant, setTenant] = useState<string | null>(null)
  const [sort, setSort] = useState<Sort>('end')

  const view: View = views.find((v) => v === requested) ?? 'all'

  const tenants = useMemo(
    () => (data?.user ?? []).filter((user) => user.stalls?.length),
    [data],
  )
  const allRows = useMemo<RentalRow[]>(
    () =>
      tenants.flatMap((user) =>
        user.stalls.map((stall) => ({ user, stall })),
      ) as RentalRow[],
    [tenants],
  )
  const countOf = (state: View) =>
    allRows.filter((row) => inView(row.stall, state)).length

  const query = search.trim().toLowerCase()
  const inViewRows = allRows
    .filter((row) => !tenant || row.user.id === tenant)
    .filter(
      (row) =>
        !query ||
        [
          row.user.name,
          row.user.email,
          row.user.phone,
          row.stall.stallName,
          String(row.stall.stallNumber),
        ].some((field) => field?.toLowerCase().includes(query)),
    )
  // Tab counts follow the tenant card and the search, the same rows the table shows.
  const countInView = (state: View) =>
    inViewRows.filter((row) => inView(row.stall, state)).length
  const rows = inViewRows
    .filter((row) => inView(row.stall, view))
    .sort(sorters[sort])

  const past = countOf('past')
  const ending = countOf('ending')

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader title="Tenants">
        {data
          ? `${tenants.length} tenants hold ${allRows.length} stalls. ${past} lease${past === 1 ? ' is' : 's are'} past the end date and ${ending} more end within ${ENDING_SOON_DAYS} days.`
          : 'Manage rentals and send email to tenants.'}
      </PageHeader>

      {error ? (
        <Panel>
          <PanelError what="tenants" onRetry={() => refetch()} />
        </Panel>
      ) : null}

      {tenants.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[260px_minmax(0,1fr)]">
          <button
            type="button"
            aria-pressed={view === 'attention'}
            onClick={() =>
              navigate({
                search: { view: 'attention' },
                replace: true,
                resetScroll: false,
              })
            }
            className="bg-card hover:bg-accent focus-visible:ring-ring flex cursor-pointer flex-col justify-center rounded-xl border p-4 text-left outline-none focus-visible:ring-2"
          >
            <span className="type-body text-muted-foreground">
              Needs follow-up
            </span>
            <span className="type-figure-lead">{past + ending}</span>
            <span className="type-meta text-muted-foreground">
              {past} past end date, {ending} ending in {ENDING_SOON_DAYS} days
            </span>
          </button>
          <div
            role="group"
            aria-label="Filter by tenant"
            className="bg-card -mx-4 flex divide-x overflow-x-auto border-y [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:divide-x-0 md:rounded-xl md:border"
          >
            {tenants.map((user) => {
              const selected = tenant === user.id
              return (
                <button
                  key={user.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setTenant(selected ? null : user.id)}
                  className={cn(
                    'focus-visible:ring-ring flex w-56 shrink-0 cursor-pointer items-center gap-2.5 p-3 text-left outline-none first:rounded-l-xl last:rounded-r-xl focus-visible:ring-2 focus-visible:ring-inset md:w-auto',
                    selected ? 'bg-brand-soft' : 'hover:bg-accent',
                  )}
                >
                  <PersonAvatar
                    id={user.id}
                    name={user.name}
                    image={user.image}
                  />
                  <span className="min-w-0">
                    <span className="type-body line-clamp-2 leading-tight font-medium">
                      {user.name}
                    </span>
                    <span className="type-meta text-muted-foreground mt-0.5 block truncate">
                      {user.stalls.length} stall
                      {user.stalls.length === 1 ? '' : 's'}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : null}

      <TablePanel>
        <PanelToolbar>
          <CountTabs
            label="Lease state"
            value={view}
            onChange={(next) =>
              navigate({
                search: next === 'all' ? {} : { view: next },
                replace: true,
                resetScroll: false,
              })
            }
            tabs={[
              { value: 'all', label: 'All leases', count: countInView('all') },
              {
                value: 'attention',
                label: 'Needs follow-up',
                count: countInView('attention'),
              },
              {
                value: 'past',
                label: 'Past end date',
                count: countInView('past'),
              },
              {
                value: 'ending',
                label: `Ending in ${ENDING_SOON_DAYS} days`,
                count: countInView('ending'),
              },
              { value: 'let', label: 'On lease', count: countInView('let') },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2 max-md:w-full xl:ml-auto">
            <SearchField
              value={search}
              onChange={setSearch}
              placeholder="Search name, email, phone or stall"
              label="Search leases"
              className="md:w-72"
            />
            <Select
              value={sort}
              onValueChange={(value) => setSort(value as Sort)}
            >
              <SelectTrigger
                aria-label="Sort leases"
                className="bg-card w-40 max-md:h-11 max-md:w-full"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="end">Soonest end</SelectItem>
                <SelectItem value="tenant">Tenant A to Z</SelectItem>
                <SelectItem value="stall">Stall number</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PanelToolbar>
        {isLoading ? (
          <div className="p-4 md:p-5">
            <PanelRowsSkeleton rows={8} />
          </div>
        ) : null}
        {data && rows.length === 0 ? (
          <div className="p-4 md:p-5">
            <PanelEmpty>
              {allRows.length === 0
                ? 'No tenant holds a stall yet. A lease appears here once a stall is rented.'
                : 'No leases match. Change the tab, tenant or search.'}
            </PanelEmpty>
          </div>
        ) : null}
        {rows.length > 0 ? <RentalsTable rows={rows} /> : null}
      </TablePanel>
    </div>
  )
}

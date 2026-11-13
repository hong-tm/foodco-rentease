import { useMemo, useState } from 'react'
import { fetchRentalsQueryOptions } from '@/api/adminApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'

import {
  ENDING_SOON_DAYS,
  byEndDate,
  leaseState,
  type LeaseState,
} from '@/lib/stall-lease'

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
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<Sort>('end')

  const requested = params.get('view') as View | null
  const view: View = requested && views.includes(requested) ? requested : 'all'

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
  const inViewRows = allRows.filter(
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
  // Tab counts follow the search, the same rows the table shows.
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

      <TablePanel>
        <PanelToolbar>
          <CountTabs
            label="Lease state"
            value={view}
            onChange={(next) =>
              setParams(next === 'all' ? {} : { view: next }, { replace: true })
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
                : 'No leases match. Change the tab or the search.'}
            </PanelEmpty>
          </div>
        ) : null}
        {rows.length > 0 ? <RentalsTable rows={rows} /> : null}
      </TablePanel>
    </div>
  )
}

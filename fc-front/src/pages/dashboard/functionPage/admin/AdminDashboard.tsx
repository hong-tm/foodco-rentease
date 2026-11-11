import { fetchStallsQueryOptions } from '@/api/stallApi'
import { PageHeader } from '@/pages/dashboard/components/PageHeader'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { ENDING_SOON_DAYS, countByState } from '@/lib/stall-lease'

import { Button } from '@/components/ui/button'

import FeedbackHapinessLineChart from './components/FeedbackHapinessLineChart'
import GrowthPanel from './components/GrowthPanel'
import IncomePanel from './components/IncomePanel'
import LatestAppointmentScrollArea from './components/LatestAppointmentScrollArea'
import LatestStallExpiryScrollArea from './components/LatestStallExpiryScrollArea'
import { VacancyChart } from './components/VacancyChart'

export function AdminDashboard() {
  const { data } = useQuery(fetchStallsQueryOptions)
  const stalls = data?.stall ?? []
  const counts = countByState(stalls)
  const rented = stalls.length - counts.free

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <PageHeader
        title="Overview"
        actions={
          <>
            <Button variant="outline" asChild className="max-md:h-11">
              <Link to="/dashboard/admin-report">Financial report</Link>
            </Button>
            <Button asChild className="max-md:h-11">
              <Link to="/dashboard/tenant-information?view=attention">
                Review leases
              </Link>
            </Button>
          </>
        }
      >
        {data
          ? `${rented} of ${stalls.length} stalls are let. ${counts.past} lease${counts.past === 1 ? ' has' : 's have'} run past the end date and ${counts.ending} more end within ${ENDING_SOON_DAYS} days.`
          : 'Loading the food court.'}
      </PageHeader>
      {/* Rail is fixed at 384px at xl so the lists keep one line width; the two
          chart columns share the rest of the canvas. */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_384px]">
        <VacancyChart className="md:col-span-2" />
        <LatestStallExpiryScrollArea />
        <IncomePanel className="md:col-span-2" />
        <LatestAppointmentScrollArea />
        <GrowthPanel className="md:col-span-2" />
        <FeedbackHapinessLineChart className="md:col-span-2 xl:col-span-1" />
      </div>
    </div>
  )
}

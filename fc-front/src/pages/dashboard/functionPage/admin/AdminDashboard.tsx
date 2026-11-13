import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { fetchCurrentVacancyQueryOptions } from '@/api/stallApi'
import { useQuery } from '@tanstack/react-query'
import { startOfDay } from 'date-fns'
import { Link } from 'react-router-dom'

import { formatDay } from '@/lib/format'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/dashboard/PageHeader'

import FeedbackHapinessLineChart from './components/FeedbackHapinessLineChart'
import LatestAppointmentScrollArea from './components/LatestAppointmentScrollArea'
import LatestStallExpiryScrollArea from './components/LatestStallExpiryScrollArea'
import { NewStartRentalChart } from './components/NewStartRentalChart'
import NewTenantChart from './components/NewTenantChart'
import StallRentalPaymentChart from './components/StallRentalPaymentChart'
import StallUtilitiesChart from './components/StallUtilitiesChart'
import { VacancyChart } from './components/VacancyChart'

const DAY_MS = 24 * 60 * 60 * 1000
const REMINDER_WINDOW_DAYS = 7

function daysLeft(endAt?: Date | string | null) {
  if (!endAt) return null
  return Math.ceil((new Date(endAt).getTime() - Date.now()) / DAY_MS)
}

export function AdminDashboard() {
  const {
    data: vacancy,
    isLoading: vacancyLoading,
    error: vacancyError,
  } = useQuery(fetchCurrentVacancyQueryOptions)
  const { data: notifications, isLoading: notificationsLoading } = useQuery(
    getAllNotificationQueryOptions,
  )

  const stalls = vacancy?.stalls ?? []
  const totalStalls = vacancy?.totalStalls ?? stalls.length
  const isOccupied = (stall: {
    rentStatus?: boolean
    endAt?: Date | string | null
  }) => {
    if (!stall.rentStatus) return false
    const left = daysLeft(stall.endAt)
    return left === null || left >= 0
  }
  const rentedStalls = stalls.filter(isOccupied).length
  const occupancy =
    totalStalls > 0 ? Math.round((rentedStalls / totalStalls) * 100) : 0

  const expiringSoon = stalls.filter((stall) => {
    const left = daysLeft(stall.endAt)
    return left !== null && left >= 0 && left <= REMINDER_WINDOW_DAYS
  }).length

  const soonest = stalls
    .filter((stall) => {
      const left = daysLeft(stall.endAt)
      return left !== null && left >= 0
    })
    .sort(
      (a, b) =>
        new Date(a.endAt as Date).getTime() -
        new Date(b.endAt as Date).getTime(),
    )[0]

  const today = startOfDay(new Date())
  const pendingAppointments = (notifications ?? []).filter(
    (notification) =>
      notification.notificationRead === null &&
      startOfDay(new Date(notification.appointmentDate)) >= today,
  ).length

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Admin Dashboard"
        description={
          expiringSoon > 0 && soonest ? (
            <>
              {expiringSoon} {expiringSoon === 1 ? 'lease ends' : 'leases end'}{' '}
              within 7 days. {soonest.stallName} is first, on{' '}
              <span className="whitespace-nowrap tabular-nums">
                {formatDay(soonest.endAt)}
              </span>
              .
            </>
          ) : (
            'Occupancy, payments and registrations across the food court.'
          )
        }
        action={
          expiringSoon > 0 ? (
            <Button asChild>
              <Link to="/dashboard/tenant-information">
                Review {expiringSoon} ending{' '}
                {expiringSoon === 1 ? 'lease' : 'leases'}
              </Link>
            </Button>
          ) : null
        }
      />

      <section aria-label="Status" className="flex flex-col gap-3">
        {vacancyError ? (
          <p className="text-muted-foreground text-sm">
            Occupancy unavailable. Stall data could not be loaded.
          </p>
        ) : vacancyLoading || notificationsLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-4 w-80" />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {/* Occupancy: the number carries a bar, so 12 of 17 reads as a share. */}
            <div className="flex min-w-0 flex-col gap-2">
              <p className="flex min-w-0 items-baseline gap-2.5">
                <span className="type-stat tabular-nums">{occupancy}%</span>
                <span className="text-muted-foreground text-sm">occupancy</span>
              </p>
              <div className="flex items-center gap-3">
                <Progress
                  value={occupancy}
                  aria-label={`${occupancy}% of stalls occupied`}
                  className="bg-brand-muted [&_[data-slot=progress-indicator]]:bg-brand h-1.5 min-w-0 flex-1"
                />
                <span className="text-muted-foreground text-xs tabular-nums">
                  {rentedStalls} of {totalStalls} stalls
                </span>
              </div>
            </div>
            {/* Same cell anatomy as SpecStrip, kept local so the occupancy bar
                can sit under the value without touching that component. */}
            <dl className="bg-card divide-border flex flex-col divide-y rounded-xl border sm:flex-row sm:divide-x sm:divide-y-0">
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-4 px-4 py-3 sm:flex-col sm:justify-start sm:gap-1 sm:px-5 sm:py-4">
                <dt className="type-label text-muted-foreground">
                  Due within 7 days
                </dt>
                <dd className="type-section-title flex items-baseline gap-2 tabular-nums max-sm:text-right">
                  {expiringSoon > 0 ? (
                    <span
                      aria-hidden="true"
                      className="bg-destructive size-2 shrink-0 self-center rounded-full"
                    />
                  ) : null}
                  <span className="min-w-0 break-words">{expiringSoon}</span>
                </dd>
              </div>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-4 px-4 py-3 sm:flex-col sm:justify-start sm:gap-1 sm:px-5 sm:py-4">
                <dt className="type-label text-muted-foreground">
                  Appointments pending
                </dt>
                <dd className="type-section-title flex items-baseline gap-2 tabular-nums max-sm:text-right">
                  {pendingAppointments > 0 ? (
                    <span
                      aria-hidden="true"
                      className="bg-primary size-2 shrink-0 self-center rounded-full"
                    />
                  ) : null}
                  <span className="min-w-0 break-words">
                    {pendingAppointments}
                  </span>
                </dd>
              </div>
            </dl>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-section-title">Occupancy and bookings</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[3fr_2fr]">
          <div className="flex flex-col gap-4">
            <VacancyChart />
            <LatestAppointmentScrollArea />
          </div>
          <LatestStallExpiryScrollArea />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-section-title">Payments</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <StallRentalPaymentChart />
          <StallUtilitiesChart />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-section-title">Growth and feedback</h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <NewTenantChart />
          <NewStartRentalChart />
          <FeedbackHapinessLineChart className="lg:col-span-2" />
        </div>
      </section>
    </div>
  )
}

import React from 'react'
import { useSession } from '@/api/adminApi'
import { getAllPaymentRecordsQueryOptions } from '@/api/paymentApi'
import { fetchStallCurrentQueryOptions } from '@/api/stallApi'
import type { PaymentRecord } from '@server/lib/sharedType'
import { useQuery } from '@tanstack/react-query'

import { formatDay } from '@/lib/format'

import { Skeleton } from '@/components/ui/skeleton'
import { PageHeader } from '@/components/dashboard/PageHeader'
import { SpecStrip } from '@/components/dashboard/SpecStrip'
import { rm } from '@/components/dashboard/monthlyTotals'

import RentalPaymentDetail from './components/RentalPaymentDetail'
import RentalStallsDetail from './components/RentalStallsDetail'

const DAY_MS = 24 * 60 * 60 * 1000

function toAmount(value?: string | number | null) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return amount !== undefined && amount !== null && Number.isFinite(amount)
    ? amount
    : 0
}

function daysLeft(endAt?: Date | string | null) {
  if (!endAt) return null
  return Math.ceil((new Date(endAt).getTime() - Date.now()) / DAY_MS)
}

export function RentalDashboard() {
  const { data: session, isLoading: sessionLoading } = useSession()
  const userId = session?.user?.id

  const {
    data: stallData,
    isLoading: stallsLoading,
    error: stallsError,
  } = useQuery({
    ...fetchStallCurrentQueryOptions(userId || ''),
    enabled: Boolean(userId),
  })

  const { data: paymentRecords, isLoading: paymentsLoading } = useQuery(
    getAllPaymentRecordsQueryOptions,
  )

  const isLoading = sessionLoading || stallsLoading || paymentsLoading
  const stalls = stallData?.stalls ?? []
  const records = paymentRecords ?? []

  const userRecords = React.useMemo(
    () => records.filter((record) => record.userId === userId),
    [records, userId],
  )

  const monthlyRentTotal = React.useMemo(
    () =>
      stalls.reduce(
        (sum, stall) =>
          sum +
          toAmount(stall.stallTierNumber?.tierPrice) *
            toAmount(stall.stallSize),
        0,
      ),
    [stalls],
  )

  const { nextLeaseValue, nextLeaseAnomaly } = React.useMemo(() => {
    if (stalls.length === 0) {
      return { nextLeaseValue: 'None', nextLeaseAnomaly: false }
    }

    const activeStalls = stalls
      .filter((stall) => {
        const left = daysLeft(stall.endAt)
        return left !== null && left >= 0
      })
      .sort((a, b) => new Date(a.endAt).getTime() - new Date(b.endAt).getTime())

    if (activeStalls.length > 0) {
      const next = activeStalls[0]
      const left = daysLeft(next.endAt)!
      const stallName = next.stallName || `Stall ${next.stallNumber}`
      const dateStr = formatDay(next.endAt) ?? 'no end date'
      return {
        nextLeaseValue: `${stallName} · ${dateStr}`,
        nextLeaseAnomaly: left <= 30,
      }
    }

    // All active leases have ended; show most recently ended
    const mostRecent = [...stalls].sort(
      (a, b) => new Date(b.endAt).getTime() - new Date(a.endAt).getTime(),
    )[0]
    const stallName = mostRecent.stallName || `Stall ${mostRecent.stallNumber}`
    const dateStr = formatDay(mostRecent.endAt) ?? 'no end date'
    return {
      nextLeaseValue: `${stallName} · ${dateStr}`,
      nextLeaseAnomaly: true,
    }
  }, [stalls])

  const dueBillsCount = React.useMemo(() => {
    const latestOf = (
      stallNumber: number,
      type: PaymentRecord['paymentType'],
    ) =>
      records
        .filter(
          (payment) =>
            payment.stallId === stallNumber && payment.paymentType === type,
        )
        .reduce<
          PaymentRecord | undefined
        >((latest, payment) => (!latest || new Date(payment.paymentDate) > new Date(latest.paymentDate) ? payment : latest), undefined)

    const now = new Date()
    const paidThisMonth = (record?: PaymentRecord) => {
      if (!record?.paymentStatus) return false
      const date = new Date(record.paymentDate)
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
      )
    }

    let count = 0
    for (const stall of stalls) {
      for (const type of ['water', 'electric'] as const) {
        const record = latestOf(stall.stallNumber, type)
        if (record && !record.paymentStatus) {
          count++
        }
      }
      const tierPrice = stall.stallTierNumber?.tierPrice
      const size = stall.stallSize
      if (tierPrice && size) {
        const rentalRecord = latestOf(stall.stallNumber, 'rental')
        if (!paidThisMonth(rentalRecord)) {
          count++
        }
      }
    }
    return count
  }, [stalls, records])

  return (
    <div className="max-w-page mx-auto flex w-full min-w-0 flex-col gap-8 px-2 lg:px-6">
      <PageHeader
        title="Rental Dashboard"
        description="Overview of your leased stalls, rental commitments, and payment history."
      />

      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <SpecStrip
          value={String(stalls.length)}
          unit={stalls.length === 1 ? 'stall held' : 'stalls held'}
          cells={[
            {
              label: 'Monthly rent',
              value: `RM ${rm(monthlyRentTotal)}`,
            },
            {
              label: 'Next lease end',
              value: nextLeaseValue,
              anomaly: nextLeaseAnomaly,
            },
            {
              label: 'Bills due',
              value: `${dueBillsCount} open`,
              anomaly: dueBillsCount > 0,
            },
          ]}
        />
      )}

      <RentalStallsDetail
        stalls={stalls}
        isLoading={isLoading}
        error={stallsError}
      />
      <RentalPaymentDetail records={userRecords} isLoading={isLoading} />
    </div>
  )
}

export default RentalDashboard

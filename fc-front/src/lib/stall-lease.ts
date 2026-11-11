import { differenceInCalendarDays } from 'date-fns'

/** Days before its end date that a lease counts as ending soon. */
export const ENDING_SOON_DAYS = 30
/** Days before its end date that a lease needs a reminder today. */
export const URGENT_DAYS = 7

export type LeaseState = 'free' | 'let' | 'ending' | 'past'

export const leaseStateLabel: Record<LeaseState, string> = {
  free: 'Free',
  let: 'On lease',
  ending: `Ending in ${ENDING_SOON_DAYS} days`,
  past: 'Past end date',
}

/**
 * States grouped by what the admin does next. Past and ending leases both mean
 * "contact the tenant", so they share one state; the text carries the urgency.
 */
export type BoardState = 'free' | 'followup' | 'let'

export const boardStateLabel: Record<BoardState, string> = {
  free: 'Free',
  followup: 'Needs follow-up',
  let: 'On lease',
}

type LeaseFields = {
  rentStatus?: boolean | null
  endAt?: Date | string | null
}

export function daysLeft(endAt?: Date | string | null) {
  if (!endAt) return null
  return differenceInCalendarDays(new Date(endAt), new Date())
}

export function leaseState({ rentStatus, endAt }: LeaseFields): LeaseState {
  if (!rentStatus) return 'free'
  const days = daysLeft(endAt)
  if (days === null) return 'let'
  if (days < 0) return 'past'
  return days <= ENDING_SOON_DAYS ? 'ending' : 'let'
}

export function boardState(stall: LeaseFields): BoardState {
  const state = leaseState(stall)
  if (state === 'free') return 'free'
  return state === 'let' ? 'let' : 'followup'
}

/** "Ended 14 days ago", "Ends today", "1 day left", "No end date" */
export function timeLeftLabel(endAt?: Date | string | null) {
  const days = daysLeft(endAt)
  if (days === null) return 'No end date'
  const plural = (n: number) => `${n} day${n === 1 ? '' : 's'}`
  if (days < 0) return `Ended ${plural(-days)} ago`
  if (days === 0) return 'Ends today'
  return `${plural(days)} left`
}

export function isUrgent(endAt?: Date | string | null) {
  const days = daysLeft(endAt)
  return days !== null && days <= URGENT_DAYS
}

/** Short label for a stall tile: "16 days over", "1 day over", else the usual label. */
export function pastLabel(endAt?: Date | string | null) {
  const days = daysLeft(endAt)
  if (days === null || days >= 0) return timeLeftLabel(endAt)
  return `${-days} day${-days === 1 ? '' : 's'} over`
}

export function countByState<T extends LeaseFields>(stalls: T[]) {
  const counts: Record<LeaseState, number> = {
    free: 0,
    let: 0,
    ending: 0,
    past: 0,
  }
  stalls.forEach((stall) => {
    counts[leaseState(stall)] += 1
  })
  return counts
}

/** Soonest end first, already-ended leases on top, open-ended last. */
export function byEndDate<T extends LeaseFields>(a: T, b: T) {
  const left = a.endAt ? new Date(a.endAt).getTime() : Infinity
  const right = b.endAt ? new Date(b.endAt).getTime() : Infinity
  return left - right
}

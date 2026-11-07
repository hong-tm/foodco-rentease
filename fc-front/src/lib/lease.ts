export const DAY_MS = 24 * 60 * 60 * 1000
export const REMINDER_WINDOW_DAYS = 7

export function daysLeft(endAt?: Date | string | null) {
  if (!endAt) return null
  return Math.ceil((new Date(endAt).getTime() - Date.now()) / DAY_MS)
}

import type { PaymentRecord } from '@server/lib/sharedType'

export type MonthSlot<K extends string> = {
  key: string
  month: string
  shortMonth: string
} & Record<K, number>

const monthKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`

// Paid totals per calendar month for the given payment types, oldest first,
// ending with the current month. Keyed by year and month so the same month
// name from another year never lands in the window.
export function monthlyPaidTotals<K extends PaymentRecord['paymentType']>(
  records: PaymentRecord[],
  types: readonly K[],
  months = 6,
): MonthSlot<K>[] {
  const today = new Date()
  const slots = Array.from({ length: months }, (_, i) => {
    const date = new Date(
      today.getFullYear(),
      today.getMonth() - (months - 1 - i),
      1,
    )
    const slot = {
      key: monthKey(date),
      month: date.toLocaleString('en-US', { month: 'long' }),
      shortMonth: date.toLocaleString('en-US', { month: 'short' }),
    } as MonthSlot<K>
    for (const type of types) (slot as Record<string, number>)[type] = 0
    return slot
  })
  const byKey = new Map(slots.map((slot) => [slot.key, slot]))

  for (const record of records) {
    if (!record.paymentStatus) continue
    if (!types.includes(record.paymentType as K)) continue
    const slot = byKey.get(monthKey(new Date(record.paymentDate)))
    if (slot)
      (slot as Record<string, number>)[record.paymentType] +=
        Number(record.paymentAmount) || 0
  }

  return slots
}

export const rm = (value: number) =>
  value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

// "November so far: RM 7,096.00 · October: RM 8,064.00". The current month is
// still running, so a percentage against a full month would read as a drop.
export function monthSummary(
  current: number,
  previous: number,
  names: [string, string],
) {
  return `${names[0]} so far: RM ${rm(current)} · ${names[1]}: RM ${rm(previous)}`
}

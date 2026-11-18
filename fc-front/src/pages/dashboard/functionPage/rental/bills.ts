import type { PaymentRecord } from '@/api/paymentApi'
import type { GetStallCurrentResponse } from '@/api/stallApi'

export type BillKind = 'rental' | 'electric' | 'water'
type LeasedStall = GetStallCurrentResponse['stalls'][number]

export type Bill = {
  kind: BillKind
  label: string
  color: string
  amount: number
  record?: PaymentRecord
  missing: string
  unpaidCount: number
  unpaidTotal: number
}

const kinds: { kind: BillKind; label: string; color: string }[] = [
  { kind: 'rental', label: 'Rental fee', color: 'var(--chart-1)' },
  { kind: 'electric', label: 'Electric', color: 'var(--chart-3)' },
  { kind: 'water', label: 'Water', color: 'var(--chart-2)' },
]

const byDate = (a: PaymentRecord, b: PaymentRecord) =>
  new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime()

export function stallBills(
  stall: LeasedStall,
  records: PaymentRecord[],
  userId: string,
): Bill[] {
  const rentalFee =
    Number(stall.stallTierNumber?.tierPrice ?? 0) * Number(stall.stallSize ?? 0)
  return kinds.map(({ kind, label, color }) => {
    const mine = records
      .filter(
        (payment) =>
          payment.userId === userId &&
          payment.stallId === stall.stallNumber &&
          payment.paymentType === kind,
      )
      .sort(byDate)
    const unpaid = mine.filter((payment) => !payment.paymentStatus)
    const record = unpaid[0] ?? mine.at(-1)
    const priceOf = (payment?: PaymentRecord) =>
      kind === 'rental' ? rentalFee : Number(payment?.paymentAmount ?? 0)
    const amount = priceOf(record)
    const owesFirstRent = kind === 'rental' && !record && amount > 0
    return {
      kind,
      label,
      color,
      amount,
      record,
      missing: kind === 'rental' ? 'No fee set' : 'No bill yet',
      unpaidCount: owesFirstRent ? 1 : unpaid.length,
      unpaidTotal: owesFirstRent
        ? amount
        : unpaid.reduce((sum, payment) => sum + priceOf(payment), 0),
    }
  })
}

export function billsDue(bills: Bill[]) {
  return {
    count: bills.reduce((sum, bill) => sum + bill.unpaidCount, 0),
    total: bills.reduce((sum, bill) => sum + bill.unpaidTotal, 0),
  }
}

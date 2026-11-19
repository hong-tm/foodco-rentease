type Approvable = {
  notificationId: number
  stallNumber: number | null
  appointmentDate: string | Date
  notificationRead: boolean | null
}

export function payRows<T extends Approvable>(
  rows: T[],
  isPaid: (stall: number) => boolean,
) {
  const pay = new Map<number, T>()
  for (const r of rows) {
    const stall = r.stallNumber
    if (!r.notificationRead || !stall || isPaid(stall)) continue
    const current = pay.get(stall)
    if (
      !current ||
      new Date(r.appointmentDate) > new Date(current.appointmentDate)
    )
      pay.set(stall, r)
  }
  return pay
}

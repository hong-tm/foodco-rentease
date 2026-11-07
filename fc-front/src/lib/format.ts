export function formatDay(value?: Date | string | null) {
  if (!value) return null
  const date = new Date(value)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

export function toAmount(value?: string | number | null) {
  const amount = typeof value === 'string' ? Number.parseFloat(value) : value
  return amount !== undefined && amount !== null && Number.isFinite(amount)
    ? amount
    : 0
}

export const rm = (value: number) =>
  value.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

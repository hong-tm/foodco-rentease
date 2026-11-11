const moneyFormat = new Intl.NumberFormat('en-MY', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** "RM 7,096.00" */
export function formatRM(value: number) {
  return `RM ${moneyFormat.format(value)}`
}

/** "+RM 12.00", "−RM 135.50" with a true minus sign */
export function formatSignedRM(value: number) {
  return `${value < 0 ? '−' : '+'}RM ${moneyFormat.format(Math.abs(value))}`
}

/** "+4.2%", "−1.9%" */
export function formatSignedPercent(value: number) {
  return `${value < 0 ? '−' : '+'}${Math.abs(value).toFixed(1)}%`
}

/** "5 Dec 2026" */
export function formatDate(value: Date | string | number) {
  return new Date(value).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Round, even axis ticks from zero with the top tick above the maximum. */
export function niceTicks(max: number, intervals = 4) {
  if (max <= 0) return [0, 1]
  const rough = max / intervals
  const power = 10 ** Math.floor(Math.log10(rough))
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((s) => s * intervals > max) ??
    10 * power
  const count = Math.floor(max / step) + 1
  return Array.from({ length: count + 1 }, (_, i) => i * step)
}

export function initials(name?: string | null) {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')
}

/** "8 m²", or a dash when the stall has no size yet */
export function formatSize(size?: string | number | null) {
  const value = Number(size)
  return value ? `${value} m²` : '—'
}

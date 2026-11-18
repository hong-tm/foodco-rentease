export function ratingColor(average: number) {
  if (average < 2.5) return 'var(--destructive)'
  if (average >= 3.5) return 'var(--positive)'
  return 'var(--chart-1)'
}

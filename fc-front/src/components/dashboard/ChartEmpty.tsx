import { cn } from '@/lib/utils'

type ChartEmptyProps = {
  message?: string
  className?: string
}

export function ChartEmpty({
  message = 'No data yet',
  className,
}: ChartEmptyProps) {
  return (
    <div
      role="status"
      className={cn(
        'text-muted-foreground flex h-[220px] items-center justify-center rounded-lg border border-dashed text-sm',
        className,
      )}
    >
      {message}
    </div>
  )
}

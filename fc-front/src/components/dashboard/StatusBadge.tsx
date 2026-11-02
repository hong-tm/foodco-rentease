import { cn } from '@/lib/utils'

import { Badge } from '@/components/ui/badge'

type StatusTone = 'action' | 'blocked' | 'settled'

type StatusBadgeProps = {
  label: string
  tone: StatusTone
  meta?: string
  className?: string
}

const badgeVariant = {
  action: 'default',
  blocked: 'destructive',
} as const

export function StatusBadge({
  label,
  tone,
  meta,
  className,
}: StatusBadgeProps) {
  if (tone === 'settled') {
    return (
      <span className={cn('text-muted-foreground text-sm', className)}>
        {label}
        {meta ? (
          <span className="ml-2 text-xs tabular-nums">{meta}</span>
        ) : null}
      </span>
    )
  }

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <Badge variant={badgeVariant[tone]} className="font-medium">
        {label}
      </Badge>
      {meta ? (
        <span className="text-muted-foreground text-xs tabular-nums">
          {meta}
        </span>
      ) : null}
    </span>
  )
}

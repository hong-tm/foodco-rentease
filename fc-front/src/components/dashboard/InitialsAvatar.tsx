import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

// Each person keeps one pale tint of the chart ramp, so a name is recognisable
// down a long list. Identity only: these never appear in a chart legend.
function tint(name: string) {
  let hash = 0
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return `color-mix(in oklch, var(--series-${(hash % 5) + 1}) 22%, var(--card))`
}

type InitialsAvatarProps = {
  name: string
  image?: string | null
  className?: string
}

export function InitialsAvatar({
  name,
  image,
  className,
}: InitialsAvatarProps) {
  return (
    <Avatar className={cn('size-7 shrink-0', className)}>
      <AvatarImage src={image ?? undefined} alt="" />
      <AvatarFallback
        className="text-foreground text-xs"
        style={{ backgroundColor: tint(name) }}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

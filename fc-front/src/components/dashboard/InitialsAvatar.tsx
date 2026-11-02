import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

type InitialsAvatarProps = {
  name: string
  image?: string | null
  className?: string
}

export function InitialsAvatar({ name, image, className }: InitialsAvatarProps) {
  return (
    <Avatar className={cn('size-7 shrink-0', className)}>
      <AvatarImage src={image ?? undefined} alt="" />
      <AvatarFallback className="bg-muted text-foreground border-border border font-mono text-xs">
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

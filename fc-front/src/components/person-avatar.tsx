import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const tones = [
  'bg-(--person-1-bg) text-(--person-1-ink)',
  'bg-(--person-2-bg) text-(--person-2-ink)',
  'bg-(--person-3-bg) text-(--person-3-ink)',
  'bg-(--person-4-bg) text-(--person-4-ink)',
  'bg-(--person-5-bg) text-(--person-5-ink)',
  'bg-(--person-6-bg) text-(--person-6-ink)',
]

function toneFor(key: string) {
  let sum = 0
  for (const char of key) sum += char.charCodeAt(0)
  return tones[sum % tones.length]
}

/** A person's stable initials on a pale tint of their own hue. */
export function PersonAvatar({
  id,
  name,
  image,
  className,
}: {
  id?: string | null
  name?: string | null
  image?: string | null
  className?: string
}) {
  return (
    <Avatar className={cn('size-8 shrink-0', className)}>
      <AvatarImage src={image ?? undefined} alt={name ?? ''} />
      <AvatarFallback
        className={cn(
          'type-meta font-semibold',
          className?.includes('size-6') && 'text-[0.625rem]',
          toneFor(id ?? name ?? '?'),
        )}
      >
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  )
}

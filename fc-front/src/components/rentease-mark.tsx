import { cn } from '@/lib/utils'

/** The product's mark: a stall under its scalloped awning. */
export function RentEaseMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className={cn('text-primary', className)}
    >
      <rect width="32" height="32" rx="9" fill="currentColor" />
      <g fill="var(--primary-foreground)">
        <path d="M8.2 8h15.6l1.7 6.2H6.500z" />
        <path d="M6.500 14.200a3.170 3.170 0 0 0 6.330 0zM12.830 14.200a3.170 3.170 0 0 0 6.340 0zM19.170 14.200a3.170 3.170 0 0 0 6.330 0z" />
        <path d="M8.500 19.300h2v5.200h3.300v-3.700h4.400v3.700h3.300v-5.200h2V26.500h-15z" />
      </g>
    </svg>
  )
}

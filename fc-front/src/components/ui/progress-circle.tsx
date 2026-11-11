import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * A circular progress indicator following the shadcn/ui conventions:
 * theme-token colours (text-primary / muted), data-slot attributes and a
 * controlled `value` between 0 and 100.
 *
 * - `value` drives the ring: 100 = full ring, 0 = empty ring.
 * - Omit `value` and pass `durationMs` to run a self-contained wind-down
 *   animation (used by the undo window, where the ring doubles as the
 *   countdown for when the action becomes final).
 */
function ProgressCircle({
  className,
  value,
  durationMs,
  size = 20,
  strokeWidth = 2.5,
  ...props
}: React.ComponentProps<'svg'> & {
  /** Ring fill 0-100; omit for the self-animating wind-down variant. */
  value?: number
  /** Self-contained animation length when `value` is omitted. */
  durationMs?: number
  size?: number
  strokeWidth?: number
}) {
  const id = React.useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const animated = value === undefined && durationMs !== undefined

  return (
    <>
      {animated ? (
        <style>{`@keyframes ${id}-wind {
          from { stroke-dashoffset: ${circumference * (1 - 1)}; }
          to { stroke-dashoffset: ${circumference}; }
        }`}</style>
      ) : null}
      <svg
        data-slot="progress-circle"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        className={cn('text-primary shrink-0', className)}
        {...props}
      >
        <circle
          data-slot="progress-circle-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/30 stroke-current"
        />
        <circle
          data-slot="progress-circle-indicator"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className="stroke-current"
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: animated
              ? undefined
              : circumference * (1 - (value ?? 0) / 100),
            transform: 'rotate(-90deg)',
            transformOrigin: 'center',
            ...(animated
              ? {
                  animation: `${id}-wind ${durationMs}ms linear forwards`,
                  strokeDashoffset: 0,
                }
              : {}),
          }}
        />
      </svg>
    </>
  )
}

export { ProgressCircle }

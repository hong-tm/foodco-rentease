import { toast } from 'sonner'

export const UNDO_WINDOW_MS = 5_000

/**
 * A 5-second countdown ring: the ring winds down as the undo window runs
 * out; when it is empty the action is final. Purely visual — the caller
 * owns the timer that actually commits the pending transaction.
 */
export function CountdownRing({ size = 18 }: { size?: number }) {
  const radius = (size - 3) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      aria-hidden="true"
      className="shrink-0"
    >
      <style>{`
        @keyframes undo-ring-wind {
          from { stroke-dashoffset: ${0}; }
          to   { stroke-dashoffset: ${circumference}; }
        }
      `}</style>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth="2.5"
        className="stroke-muted-foreground/40"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-foreground origin-center"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: 0,
          transform: 'rotate(-90deg)',
          animation: `undo-ring-wind ${UNDO_WINDOW_MS}ms linear forwards`,
        }}
      />
    </svg>
  )
}

/**
 * The undo affordance: message + countdown ring, with an Undo action.
 * The caller decides what Undo does; the toast dismisses itself when the
 * window expires.
 */
export function showUndoToast({
  message,
  onUndo,
  durationMs = UNDO_WINDOW_MS,
}: {
  message: string
  onUndo: () => void
  durationMs?: number
}) {
  toast(message, {
    duration: durationMs,
    icon: <CountdownRing />,
    action: {
      label: 'Undo',
      onClick: onUndo,
    },
  })
}

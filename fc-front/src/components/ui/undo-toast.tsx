import { Undo2Icon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'

// The undo contract for the whole site: the ring animation, sonner's
// toast lifetime and the commit timer in use-deferred-action must all
// read this one constant.
export const UNDO_WINDOW_MS = 5000

// Ring geometry: r=7 in a 16x16 viewBox. stroke-dashoffset animates from
// 0 (full ring) to the circumference (empty) as the window elapses.
const RING_CIRCUMFERENCE = 2 * Math.PI * 7

// Keyframes stay local so no global stylesheet edit is needed; the
// reduced-motion clamp in index.css freezes the ring for those users.
const RING_KEYFRAMES = `@keyframes fc-undo-ring {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: ${RING_CIRCUMFERENCE}; }
}`

export function UndoToast({
  id,
  title,
  onUndo,
}: {
  id: string | number
  title: string
  onUndo: () => void
}) {
  return (
    <div
      data-testid="undo-toast"
      role="status"
      className="border-border bg-popover text-popover-foreground flex items-center gap-3 rounded-lg border px-4 py-3"
    >
      <style>{RING_KEYFRAMES}</style>
      <svg
        className="text-muted-foreground size-4 -rotate-90"
        viewBox="0 0 16 16"
        aria-hidden="true"
      >
        <circle
          className="stroke-muted fill-none"
          cx="8"
          cy="8"
          r="7"
          strokeWidth="2"
          opacity="0.4"
        />
        <circle
          className="fill-none stroke-current"
          cx="8"
          cy="8"
          r="7"
          strokeWidth="2"
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeLinecap="round"
          style={{
            animation: `fc-undo-ring ${UNDO_WINDOW_MS}ms linear forwards`,
          }}
        />
      </svg>
      <p className="text-sm">{title}</p>
      <Button
        type="button"
        variant="link"
        size="sm"
        data-testid="undo-button"
        onClick={() => {
          onUndo()
          toast.dismiss(id)
        }}
      >
        <Undo2Icon className="size-3.5" aria-hidden="true" />
        Undo
      </Button>
    </div>
  )
}

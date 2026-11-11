import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProgressCircle } from '@/components/ui/progress-circle'

const UNDO_WINDOW_MS = 5_000
const REWIND_MS = 350

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The undo affordance: countdown ring + message + a shadcn Undo button.
 * The ring is driven by requestAnimationFrame so clicking Undo can
 * visibly rewind it before the toast dismisses — time flowing backwards
 * is the whole point of an undo.
 */
function UndoToastContent({
  message,
  onUndoConfirmed,
}: {
  message: string
  onUndoConfirmed: () => void
}) {
  const [progress, setProgress] = useState(100)
  const [rewinding, setRewinding] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const remaining = 100 - ((now - start) / UNDO_WINDOW_MS) * 100
      if (remaining <= 0) {
        setProgress(0)
        return
      }
      setProgress(remaining)
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [])

  function handleUndo() {
    if (rewinding) return
    cancelAnimationFrame(raf.current)

    if (prefersReducedMotion()) {
      onUndoConfirmed()
      return
    }

    setRewinding(true)
    const from = progress
    const t0 = performance.now()
    const rewind = (now: number) => {
      const k = Math.min(1, (now - t0) / REWIND_MS)
      const eased = 1 - Math.pow(1 - k, 3)
      setProgress(from + (100 - from) * eased)
      if (k < 1) {
        raf.current = requestAnimationFrame(rewind)
      } else {
        onUndoConfirmed()
      }
    }
    raf.current = requestAnimationFrame(rewind)
  }

  return (
    <div
      data-slot="undo-toast"
      className="text-popover-foreground flex w-full items-center gap-3"
    >
      <ProgressCircle value={progress} />
      <span className="flex-1 text-sm">{message}</span>
      <Button
        size="sm"
        variant="outline"
        data-slot="undo-toast-button"
        onClick={handleUndo}
        disabled={rewinding}
      >
        {rewinding ? 'Restoring…' : 'Undo'}
      </Button>
    </div>
  )
}

/**
 * Hold a TanStack DB transaction open for the undo window:
 * the optimistic state is already applied by the caller; when the window
 * expires the transaction commits (mutationFn persists to the server),
 * and the Undo action rolls it back so the server is never contacted.
 * The toast dismisses itself as part of the undo — rewound ring and all.
 */
type UndoableTransaction = {
  // TanStack DB transactions return themselves from rollback and a
  // promise from commit; both suffice for fire-and-forget control here.
  commit: () => Promise<unknown> | unknown
  rollback: () => Promise<unknown> | unknown
}

export function holdTransactionForUndo(
  tx: UndoableTransaction,
  { message, onUndo }: { message: string; onUndo?: () => void },
) {
  let undone = false

  toast.custom(
    (toastId) => (
      <UndoToastContent
        message={message}
        onUndoConfirmed={() => {
          undone = true
          toast.dismiss(toastId)
          void Promise.resolve(tx.rollback())
          onUndo?.()
        }}
      />
    ),
    { duration: UNDO_WINDOW_MS },
  )

  window.setTimeout(() => {
    if (!undone) {
      void Promise.resolve(tx.commit()).catch(() => {
        toast.error('The change could not be saved — restored from server')
      })
    }
  }, UNDO_WINDOW_MS)
}

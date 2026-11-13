import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { createUndoWindow } from '@/components/undo-window'

const UNDO_WINDOW_MS = 5_000
const REWIND_MS = 350

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * The undo affordance: countdown ring + message + a shadcn Undo button on
 * a popover surface (toast.custom renders unstyled, so the surface lives
 * here). The ring can visibly rewind after Undo before the toast closes.
 */
function UndoToastContent({
  message,
  startedAt,
  onUndo,
}: {
  message: string
  /** performance.now() when the window opened; the ring reads the same clock as the commit timer. */
  startedAt: number
  /** Claims the undo; false when the window already committed. */
  onUndo: () => boolean
}) {
  const [progress, setProgress] = useState(100)
  const [rewinding, setRewinding] = useState(false)
  const raf = useRef(0)

  useEffect(() => {
    const tick = (now: number) => {
      const remaining = 100 - ((now - startedAt) / UNDO_WINDOW_MS) * 100
      setProgress(Math.max(0, remaining))
      if (remaining > 0) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [startedAt])

  function handleUndo() {
    if (rewinding || !onUndo()) return
    cancelAnimationFrame(raf.current)
    setRewinding(true)
    if (prefersReducedMotion()) {
      setProgress(100)
      return
    }
    const from = progress
    const t0 = performance.now()
    const rewind = (now: number) => {
      const k = Math.min(1, (now - t0) / REWIND_MS)
      setProgress(from + (100 - from) * (1 - Math.pow(1 - k, 3)))
      if (k < 1) raf.current = requestAnimationFrame(rewind)
    }
    raf.current = requestAnimationFrame(rewind)
  }

  return (
    <div
      data-slot="undo-toast"
      role="status"
      className="bg-popover text-popover-foreground border-border flex w-(--width) items-center gap-3 rounded-lg border p-3 pl-4 shadow-lg"
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
        {rewinding ? 'Restored' : 'Undo'}
      </Button>
    </div>
  )
}

/**
 * Hold a TanStack DB transaction open for the undo window:
 * the optimistic state is already applied by the caller; when the window
 * expires the transaction commits (mutationFn persists to the server) and
 * the toast closes with it. Undo rolls the transaction back at the click,
 * so the server is never contacted, then the ring rewinds and the toast
 * closes. One clock drives both: hovering the toast pauses nothing.
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
  const toastId = `undo-${Math.random().toString(36).slice(2)}`
  const startedAt = performance.now()

  const undoWindow = createUndoWindow({
    ms: UNDO_WINDOW_MS,
    commit: () => {
      void Promise.resolve(tx.commit()).catch(() => {
        toast.error('The change could not be saved — restored from server')
      })
    },
    rollback: () => {
      void Promise.resolve(tx.rollback())
      onUndo?.()
    },
    onCommitted: () => toast.dismiss(toastId),
  })

  toast.custom(
    () => (
      <UndoToastContent
        message={message}
        startedAt={startedAt}
        onUndo={() => {
          if (!undoWindow.undo()) return false
          window.setTimeout(
            () => toast.dismiss(toastId),
            prefersReducedMotion() ? 0 : REWIND_MS + 150,
          )
          return true
        }}
      />
    ),
    { id: toastId, duration: Infinity, unstyled: true },
  )
}

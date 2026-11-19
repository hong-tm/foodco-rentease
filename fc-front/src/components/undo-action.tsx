import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { createUndoWindow } from '@/components/undo-window'

const UNDO_WINDOW_MS = 5_000
const REWIND_MS = 350

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function UndoToastContent({
  message,
  startedAt,
  onUndo,
}: {
  message: string
  startedAt: number
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

type Settles = { when: (state: 'settled') => Promise<unknown> }

export function offerUndo(
  change: Settles,
  {
    message,
    failed,
    undo,
    onUndone,
  }: {
    message: string
    failed: string
    undo: () => Settles
    onUndone?: () => void
  },
) {
  const toastId = `undo-${Math.random().toString(36).slice(2)}`
  const startedAt = performance.now()

  const undoWindow = createUndoWindow({
    ms: UNDO_WINDOW_MS,
    undo: () => {
      undo()
        .when('settled')
        .catch(() => {
          toast.error('Undo could not be saved. The change is still in place.')
        })
      onUndone?.()
    },
    onExpired: () => toast.dismiss(toastId),
  })

  change.when('settled').catch(() => {
    undoWindow.fail()
    toast.dismiss(toastId)
    toast.error(failed)
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

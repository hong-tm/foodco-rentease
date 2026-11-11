import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ProgressCircle } from '@/components/ui/progress-circle'

export const UNDO_WINDOW_MS = 5_000

/**
 * The undo affordance: countdown ring + message + a shadcn Undo button,
 * rendered as a fully custom toast so every pixel follows the design system.
 */
function UndoToastContent({
  message,
  onUndo,
}: {
  message: string
  onUndo: () => void
}) {
  return (
    <div
      data-slot="undo-toast"
      className="text-popover-foreground flex w-full items-center gap-3"
    >
      <ProgressCircle durationMs={UNDO_WINDOW_MS} />
      <span className="flex-1 text-sm">{message}</span>
      <Button
        size="sm"
        variant="outline"
        data-slot="undo-toast-button"
        onClick={onUndo}
      >
        Undo
      </Button>
    </div>
  )
}

/**
 * Hold a TanStack DB transaction open for the undo window:
 * the optimistic state is already applied by the caller; when the window
 * expires the transaction commits (mutationFn persists to the server),
 * and the Undo action rolls it back so the server is never contacted.
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
    () => (
      <UndoToastContent
        message={message}
        onUndo={() => {
          undone = true
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

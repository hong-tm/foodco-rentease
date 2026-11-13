/**
 * One undo window, one clock. The window either commits when it runs out
 * or is undone before that — never both, and nothing after it settles.
 * Kept free of React and sonner so the rule can be tested on its own.
 */
export type UndoWindowState = 'pending' | 'undone' | 'committed'

export function createUndoWindow({
  ms,
  commit,
  rollback,
  onCommitted,
  setTimer = (fn, delay) => window.setTimeout(fn, delay),
  clearTimer = (id) => window.clearTimeout(id as number),
}: {
  ms: number
  commit: () => void
  rollback: () => void
  onCommitted?: () => void
  setTimer?: (fn: () => void, delay: number) => unknown
  clearTimer?: (id: unknown) => void
}) {
  let state: UndoWindowState = 'pending'

  const timer = setTimer(() => {
    if (state !== 'pending') return
    state = 'committed'
    commit()
    onCommitted?.()
  }, ms)

  return {
    get state() {
      return state
    },
    /** Returns false when the window already committed (or was undone). */
    undo() {
      if (state !== 'pending') return false
      state = 'undone'
      clearTimer(timer)
      rollback()
      return true
    },
  }
}

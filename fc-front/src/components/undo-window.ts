export type UndoWindowState = 'open' | 'undone' | 'expired' | 'failed'

export function createUndoWindow({
  ms,
  undo,
  onExpired,
  setTimer = (fn, delay) => window.setTimeout(fn, delay),
  clearTimer = (id) => window.clearTimeout(id as number),
}: {
  ms: number
  undo: () => void
  onExpired?: () => void
  setTimer?: (fn: () => void, delay: number) => unknown
  clearTimer?: (id: unknown) => void
}) {
  let state: UndoWindowState = 'open'

  const timer = setTimer(() => {
    if (state !== 'open') return
    state = 'expired'
    onExpired?.()
  }, ms)

  return {
    get state() {
      return state
    },
    undo() {
      if (state !== 'open') return false
      state = 'undone'
      clearTimer(timer)
      undo()
      return true
    },
    fail() {
      if (state !== 'open') return false
      state = 'failed'
      clearTimer(timer)
      return true
    },
  }
}

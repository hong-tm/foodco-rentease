import { createElement } from 'react'
import { useQueryClient, type QueryKey } from '@tanstack/react-query'
import { toast } from 'sonner'

import { UNDO_WINDOW_MS, UndoToast } from '@/components/ui/undo-toast'

/**
 * How to find the row list inside one cached query entry. The default for
 * both `remove` and `patch` assumes the entry IS the list; caches that wrap
 * rows in an object (e.g. `{ users: [...] }`) pass a lens.
 */
export type ListLens<TData, TRow> = {
  read: (data: TData | undefined) => TRow[] | undefined
  write: (data: TData | undefined, rows: TRow[]) => TData | undefined
}

const arrayLens = <TRow>(): ListLens<TRow[], TRow> => ({
  read: (data) => data,
  write: (_data, rows) => rows,
})

type DeferredActionArgs<TRow, TData> = {
  /** Prefix-matched against every cached query this action should patch. */
  queryKey: QueryKey
  lens: ListLens<TData, TRow>
  matches: (row: TRow) => boolean
  /** The optimistic row; null removes it from the list. */
  next: (row: TRow) => TRow | null
  /** The real server write, called only when the undo window closes. */
  commit: () => Promise<unknown>
  invalidateKey?: QueryKey
  pendingTitle: string
  successTitle?: string
  errorTitle: string
}

type RemoveArgs<TRow> = Omit<DeferredActionArgs<TRow, TRow[]>, 'lens' | 'next'>

type ArrayPatchArgs<TRow> = Omit<
  DeferredActionArgs<TRow, TRow[]>,
  'lens' | 'next'
> & {
  next: (row: TRow) => TRow
}

type WrappedPatchArgs<TRow, TData> = Omit<
  DeferredActionArgs<TRow, TData>,
  'next'
> & {
  next: (row: TRow) => TRow
}

type LoosePatchArgs<TRow> = {
  queryKey: QueryKey
  lens?: ListLens<any, TRow>
  matches: (row: TRow) => boolean
  next: (row: TRow) => TRow
  commit: () => Promise<unknown>
  invalidateKey?: QueryKey
  pendingTitle: string
  successTitle?: string
  errorTitle: string
}

/**
 * Gmail-style deferred action: the cached list changes at once, a countdown
 * undo toast appears, and the real server write fires only after the undo
 * window closes. Undo within the window restores the cache and cancels the
 * write. An API failure after the window restores the cache as well.
 */
export function useDeferredAction() {
  const queryClient = useQueryClient()

  function defer<TRow, TData>(args: DeferredActionArgs<TRow, TData>) {
    const {
      queryKey,
      lens,
      matches,
      next,
      commit,
      invalidateKey = queryKey,
      pendingTitle,
      successTitle,
      errorTitle,
    } = args

    const commitDirectly = () =>
      commit().then(
        () => {
          if (successTitle) toast.success(successTitle)
          queryClient.invalidateQueries({ queryKey: invalidateKey })
        },
        (error: unknown) => {
          toast.error(error instanceof Error ? error.message : errorTitle)
        },
      )

    const entries = queryClient.getQueriesData<TData>({ queryKey })
    const hits = entries.flatMap(([key, data]) => {
      const rows = lens.read(data)
      const index = rows?.findIndex(matches)
      if (rows === undefined || index === undefined || index === -1) return []
      return [{ key, row: rows[index], index }]
    })

    // No cached list to patch (page still loading, or the row is gone):
    // skip the optimistic change and the undo window entirely.
    if (hits.length === 0) {
      commitDirectly()
      return
    }

    for (const hit of hits) {
      queryClient.setQueryData<TData>(hit.key, (current) => {
        const rows = lens.read(current)
        const index = rows?.findIndex(matches)
        if (!rows || index === undefined || index === -1) return current
        const updated = rows.slice()
        const changed = next(rows[index])
        if (changed === null) updated.splice(index, 1)
        else updated.splice(index, 1, changed)
        return lens.write(current, updated)
      })
    }

    const restore = () => {
      for (const hit of hits) {
        queryClient.setQueryData<TData>(hit.key, (current) => {
          const rows = lens.read(current)
          if (!rows) return current
          const updated = rows.slice()
          const index = updated.findIndex(matches)
          if (index === -1) {
            updated.splice(Math.min(hit.index, updated.length), 0, hit.row)
          } else {
            updated.splice(index, 1, hit.row)
          }
          return lens.write(current, updated)
        })
      }
    }

    let undone = false
    let toastId: string | number | undefined

    const timer = setTimeout(() => {
      if (toastId !== undefined) toast.dismiss(toastId)
      commit()
        .then(
          () => {
            if (successTitle) toast.success(successTitle)
          },
          (error: unknown) => {
            restore()
            toast.error(error instanceof Error ? error.message : errorTitle)
          },
        )
        .finally(() => {
          queryClient.invalidateQueries({ queryKey: invalidateKey })
        })
    }, UNDO_WINDOW_MS)

    const undo = () => {
      if (undone) return
      undone = true
      clearTimeout(timer)
      restore()
    }

    toast.custom(
      (id) => {
        toastId = id
        return createElement(UndoToast, { id, title: pendingTitle, onUndo: undo })
      },
      { duration: UNDO_WINDOW_MS },
    )
  }

  /** Deferred remove: the row vanishes now, the server delete happens
   * only when the undo window closes. */
  function remove<TRow>(args: RemoveArgs<TRow>) {
    defer({ ...args, lens: arrayLens<TRow>(), next: () => null })
  }

  /** Deferred status flip: the cached row changes now, the server write
   * happens only when the undo window closes. */
  function patch<TRow>(args: ArrayPatchArgs<TRow>): void
  /** Same flip for caches that wrap rows in an object (e.g. `{ users: ... }`):
   * pass a lens instead of the array default. */
  function patch<TRow, TData>(args: WrappedPatchArgs<TRow, TData>): void
  function patch<TRow>(args: LoosePatchArgs<TRow>): void {
    const { lens, ...rest } = args
    if (lens) {
      defer<TRow, any>({ ...rest, lens, next: (row) => args.next(row) })
    } else {
      defer<TRow, TRow[]>({
        ...rest,
        lens: arrayLens<TRow>(),
        next: (row) => args.next(row),
      })
    }
  }

  return { remove, patch }
}

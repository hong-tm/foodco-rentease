import { Skeleton } from '@/components/ui/skeleton'

export function StallsTableSkeleton() {
  const row = (count: number) => (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-16 rounded-lg" />
      ))}
    </div>
  )

  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Loading stalls…</span>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="flex flex-col gap-3" aria-hidden="true">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="border-border rounded-xl border p-4 sm:p-6">
          <div className="flex flex-col gap-4">
            {row(7)}
            {[0, 1, 2].map((pair) => (
              <div key={pair} className="grid grid-cols-2 gap-3 lg:grid-cols-7">
                <Skeleton className="h-16 rounded-lg" />
                <span className="border-border col-span-5 mx-2 border-t border-dashed max-lg:hidden" />
                <Skeleton className="h-16 rounded-lg" />
              </div>
            ))}
            {row(7)}
          </div>
        </div>
      </div>
    </div>
  )
}

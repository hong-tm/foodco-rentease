import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

import { useIsMobile } from '@/hooks/use-mobile'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StallsTableSkeleton() {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Card className="w-full border-none shadow-none">
        <CardHeader>
          <VisuallyHidden>
            <CardTitle></CardTitle>
          </VisuallyHidden>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {Array.from({ length: 20 }).map((_, index) => (
              <Skeleton key={index} className="h-16 w-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderRow = (count: number, isMiddleRow: boolean) => (
    <div
      className={`flex ${
        isMiddleRow ? 'justify-between' : 'justify-center gap-4'
      } items-center py-2`}
    >
      {isMiddleRow ? (
        <>
          <Skeleton className="h-16 w-16" />
          <div className="mx-4 grow border-t border-dashed border-gray-300"></div>
          <Skeleton className="h-16 w-16" />
        </>
      ) : (
        Array.from({ length: count }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-16" />
        ))
      )}
    </div>
  )

  return (
    <Card className="mx-auto grid w-full max-w-3xl grid-cols-1 border-none shadow-none">
      <CardHeader>
        <VisuallyHidden>
          <CardTitle></CardTitle>
        </VisuallyHidden>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="flex min-w-[500px] flex-col gap-6">
          {renderRow(7, false)} {/* First row */}
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>{renderRow(2, true)}</div> /* Middle rows */
          ))}
          {renderRow(7, false)} {/* Last row */}
        </div>
      </CardContent>
    </Card>
  )
}

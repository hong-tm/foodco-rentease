import { useSession } from '@/api/adminApi'
import { stallsQueryKey, type StallButtonProps } from '@/api/stallApi'
import { ResponsiveSheetDialog } from '@/pages/dashboard/components/ResponsiveSheetDialog'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { formatDay } from '@/lib/format'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import StallDetailForm from '../../user/components/StallDetailForm'
import type { StallState } from './StallsTable'
import UpdateStallForm from './UpdateStallForm'

function areaLabel(size?: number | string | null) {
  const value = typeof size === 'string' ? Number.parseFloat(size) : size
  return value && Number.isFinite(value) ? `${value} m²` : 'Area not recorded'
}

function stallName(stall: StallUserAttributes) {
  if (!stall.stallName || stall.stallName === 'Still Empty...') return null
  return stall.stallName
}

export const StallButton: React.FC<
  StallButtonProps & { state?: StallState }
> = ({ stall, onOpen, isOpen, state = 'rented' }) => {
  const queryClient = useQueryClient()
  const stallId = `stall-${stall.stallNumber}`

  const handleUpdateSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: stallsQueryKey.stalls() })
    onOpen(null)
  }

  const { data: session, isLoading, error } = useSession()

  if (isLoading) {
    return <div className="border-border h-16 rounded-lg border" />
  }
  if (error) {
    toast.error('An error occurred: ' + error)
    return <div className="border-border h-16 rounded-lg border" />
  }

  const name = stallName(stall)
  const owner = stall.stallOwnerId?.name
  const lease = stall.endAt
    ? `Lease ends ${formatDay(stall.endAt)}`
    : 'No end date set'
  const stateLabel =
    state === 'vacant' ? 'vacant' : state === 'ended' ? 'lease ended' : 'rented'
  const accessibleName = `Stall ${stall.stallNumber}, ${name ?? 'no name'}, ${stateLabel}`

  return (
    <div className="min-w-0">
      <ResponsiveSheetDialog
        isOpen={isOpen}
        setIsOpen={(open) => onOpen(open ? stallId : null)}
        title="Stall Details"
        description={`Details of the stall ${stall.stallNumber}`}
      >
        {session?.user.role === 'admin' ? (
          <UpdateStallForm stall={stall} onSubmit={handleUpdateSuccess} />
        ) : (
          <StallDetailForm stall={stall} onSubmit={handleUpdateSuccess} />
        )}
      </ResponsiveSheetDialog>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            onClick={() => onOpen(stallId)}
            variant="ghost"
            aria-label={accessibleName}
            className={cn(
              'h-auto w-full min-w-0 flex-col items-start justify-start gap-1 rounded-lg border p-3 text-left whitespace-normal transition-colors',
              state === 'vacant'
                ? 'border-border bg-muted/20 hover:bg-muted/40 border-dashed'
                : 'border-border bg-card hover:bg-muted/40',
              state === 'ended' && 'border-destructive/50',
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="text-sm leading-none font-semibold tabular-nums">
                {stall.stallNumber}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'size-2 shrink-0 rounded-full',
                  state === 'vacant' && 'border-muted-foreground/60 border',
                  state === 'rented' && 'bg-foreground',
                  state === 'ended' &&
                    'bg-destructive dark:bg-destructive-foreground',
                )}
              />
            </span>
            <span className="text-muted-foreground line-clamp-2 text-xs leading-snug">
              {name ?? 'No tenant yet'}
            </span>
            {state === 'ended' && (
              <span className="text-destructive text-xs font-medium tabular-nums">
                Lease ended {formatDay(stall.endAt)}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{name ?? `Stall ${stall.stallNumber}`}</p>
          <p>{stall.description || 'No description'}</p>
          <p className="tabular-nums">{areaLabel(stall.stallSize)}</p>
          <p>{owner ?? 'No tenant'}</p>
          <p className="tabular-nums">{lease}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

import { useSession } from '@/api/adminApi'
import { stallsQueryKey } from '@/api/stallApi'
import { ResponsiveSheetDialog } from '@/pages/dashboard/components/ResponsiveSheetDialog'
import UpdateStallForm from '@/pages/dashboard/functionPage/admin/components/UpdateStallForm'
import StallDetailForm from '@/pages/dashboard/functionPage/user/components/StallDetailForm'
import type { StallUserAttributes } from '@server/db/userModel'
import { useQueryClient } from '@tanstack/react-query'

import { formatSize } from '@/lib/format'
import {
  boardState,
  boardStateLabel,
  isUrgent,
  timeLeftLabel,
} from '@/lib/stall-lease'
import { cn } from '@/lib/utils'

/** Stall details: admins edit the stall, everyone else can apply for it. */
export function StallDialog({
  stall,
  onClose,
}: {
  stall: StallUserAttributes | null
  onClose: () => void
}) {
  const queryClient = useQueryClient()
  const { data: session } = useSession()

  if (!stall || !session) return null

  const handleSubmit = async () => {
    await queryClient.invalidateQueries({ queryKey: stallsQueryKey.stalls() })
    onClose()
  }

  return (
    <ResponsiveSheetDialog
      key={stall.stallNumber}
      isOpen
      setIsOpen={(open) => {
        if (!open) onClose()
      }}
      title={`Stall ${stall.stallNumber}: ${stall.stallName}`}
      description={[
        boardStateLabel[boardState(stall)],
        stall.stallSize ? formatSize(stall.stallSize) : null,
        stall.stallTierNumber?.tierName,
      ]
        .filter(Boolean)
        .join(' · ')}
    >
      {boardState(stall) === 'free' ? null : (
        <dl className="bg-muted/50 mb-4 grid grid-cols-2 gap-x-4 gap-y-3 rounded-lg p-3">
          <div className="min-w-0">
            <dt className="type-meta text-muted-foreground">Tenant</dt>
            <dd className="type-body truncate font-medium">
              {stall.stallOwnerId?.name ?? 'None'}
            </dd>
          </div>
          <div className="min-w-0">
            <dt className="type-meta text-muted-foreground">Lease</dt>
            <dd
              className={cn(
                'type-body font-medium',
                isUrgent(stall.endAt) && 'text-negative-ink',
              )}
            >
              {timeLeftLabel(stall.endAt)}
            </dd>
          </div>
        </dl>
      )}
      {session.user.role === 'admin' ? (
        <UpdateStallForm stall={stall} onSubmit={handleSubmit} />
      ) : (
        <StallDetailForm stall={stall} onSubmit={handleSubmit} />
      )}
    </ResponsiveSheetDialog>
  )
}

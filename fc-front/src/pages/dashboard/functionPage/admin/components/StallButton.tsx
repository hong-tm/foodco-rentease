import { useSession } from '@/api/adminApi'
import { type StallButtonProps, stallsQueryKey } from '@/api/stallApi'
import { ResponsiveSheetDialog } from '@/pages/dashboard/components/ResponsiveSheetDialog'
import { useQueryClient } from '@tanstack/react-query'
import { FishSymbolIcon } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import StallDetailForm from '../../user/components/StallDetailForm'
import UpdateStallForm from './UpdateStallForm'

export const StallButton: React.FC<StallButtonProps> = ({
  stall,
  onOpen,
  isOpen,
}) => {
  const queryClient = useQueryClient()
  const stallId = `stall-${stall.stallNumber}`

  const handleUpdateSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: stallsQueryKey.stalls() })
    onOpen(null)
  }

  const { data: session, isLoading, error } = useSession()

  if (isLoading) return <div>Loading...</div>
  if (error) return toast.error('An error occurred: ' + error)

  return (
    <div>
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

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => onOpen(stallId)}
              variant={stall.rentStatus ? 'secondary' : 'destructive'}
              size="lg"
              className="flex h-16 w-16 flex-col items-center justify-center p-0"
            >
              <FishSymbolIcon className="mb-1 size-6" />
              <span className="text-xs">{stall.stallNumber}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{stall.stallName || 'Not available'}</p>
            <p>{stall.description || 'No description'}</p>
            <p>{stall.stallSize ? `${stall.stallSize} m²` : 'No size'}</p>
            <p>
              {stall.stallOwner ? `${stall.stallOwnerId.name}` : 'Not rent yet'}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { ResponsiveSheetDialog } from '@/pages/dashboard/components/ResponsiveSheetDialog'
import { FishSymbol } from 'lucide-react'
import UpdateStallForm from './UpdateStallForm'
import { StallButtonProps } from '@/api/stallApi'
import { useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/api/adminApi'
import { toast } from 'sonner'
import StallDetailForm from '../../user/components/StallDetailForm'

export const StallButton: React.FC<StallButtonProps> = ({
  stall,
  onOpen,
  isOpen,
}) => {
  const queryClient = useQueryClient()
  const stallId = `stall-${stall.stallNumber}`

  const handleUpdateSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ['fetch-stalls'] })
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
              <FishSymbol className="mb-1 h-6 w-6" />
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

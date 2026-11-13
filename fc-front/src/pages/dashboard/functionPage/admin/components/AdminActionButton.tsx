import { useState } from 'react'
import { useSession, usersQueryKey, type GetUsersResponse } from '@/api/adminApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { type ListLens, useDeferredAction } from '@/hooks/use-deferred-action'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronDownIcon,
  UserPenIcon,
  UserRoundCheckIcon,
  UserRoundCogIcon,
  UserXIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserRow = GetUsersResponse['users'][number]

type UserAction = {
  userId: string
  userRole?: string
  userBanned?: boolean | null
}

// The users cache stores `{ users: [...] }`; the lens gives the deferred
// action access to the row list inside that object.
const usersLens: ListLens<GetUsersResponse, UserRow> = {
  read: (data) => data?.users,
  write: (data, users) => ({ ...(data ?? { users: [] }), users }),
}

// Throwing inside better-auth's `onError` rejects the client promise, which
// the deferred hook turns into its error toast.
function throwAuthError(ctx: { error: { message?: string; statusText?: string } }) {
  throw new Error(ctx.error.message ?? ctx.error.statusText ?? 'An error occurred')
}

export function AdminActionButton({
  userId,
  userRole,
  userBanned,
}: UserAction) {
  const queryClient = useQueryClient()
  const deferred = useDeferredAction()
  const [openImpersonate, setOpenImpersonate] = useState(false)

  const { refetch } = useSession()

  const nextRole = userRole === 'rental' ? 'user' : 'rental'

  const handleChangeRole = () =>
    deferred.patch<UserRow, GetUsersResponse>({
      queryKey: usersQueryKey.users(),
      lens: usersLens,
      matches: (user) => user.id === userId,
      next: (user) => ({ ...user, role: nextRole }),
      commit: () =>
        authClient.admin.setRole({
          userId,
          role: nextRole,
          fetchOptions: { onError: throwAuthError },
        }),
      invalidateKey: usersQueryKey.all,
      pendingTitle: `Role changed to ${nextRole}`,
      successTitle: 'Role changed successfully',
      errorTitle: 'Role change failed',
    })

  const navigate = useNavigate()

  const handleImpersonateUser = async () => {
    await authClient.admin.impersonateUser({
      userId,
      fetchOptions: {
        onSuccess: () => {
          navigate('/dashboard', { replace: true })
          toast.success('Impersonating user successfully')
          queryClient.invalidateQueries({
            queryKey: ['user-session'],
            refetchType: 'active',
          })
        },
        onError: (ctx) => {
          toast.error(ctx.error.message ?? 'An error occurred')
        },
      },
    })
    setOpenImpersonate(false)
    await refetch()
  }

  const handleToggleBan = () =>
    deferred.patch<UserRow, GetUsersResponse>({
      queryKey: usersQueryKey.users(),
      lens: usersLens,
      matches: (user) => user.id === userId,
      next: (user) => ({ ...user, banned: !user.banned }),
      commit: () =>
        userBanned
          ? authClient.admin.unbanUser({
              userId,
              fetchOptions: { onError: throwAuthError },
            })
          : authClient.admin.banUser({
              userId,
              banExpiresIn: 60 * 60 * 24 * 1, // 1 day
              fetchOptions: { onError: throwAuthError },
            }),
      invalidateKey: usersQueryKey.all,
      pendingTitle: userBanned ? 'User unbanned' : 'User banned (1 day)',
      successTitle: userBanned
        ? 'User unbanned successfully'
        : 'User banned successfully (1 day)',
      errorTitle: 'Ban action failed',
    })

  return (
    <>
      <DropdownMenu>
        <ResponsiveAlertDialog
          title="Sign in as this account?"
          description="Your admin session ends and this account's dashboard opens. Sign out afterwards to return."
          confirmLabel="Impersonate"
          onClick={handleImpersonateUser}
          open={openImpersonate}
          setOpen={setOpenImpersonate}
        />
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'focus-visible:ring-foreground/80 focus-visible:ring-1 focus-visible:ring-offset-0',
              'text-muted-foreground hover:bg-muted/60 hover:text-foreground focus-visible:text-foreground transition-colors',
            )}
          >
            Manage
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Account action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleChangeRole}>
            <UserPenIcon />
            Change role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenImpersonate(true)}>
            <UserRoundCogIcon />
            Impersonate user
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleBan}>
            {userBanned ? <UserRoundCheckIcon /> : <UserXIcon />}
            {userBanned ? 'Unban user' : 'Ban user'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

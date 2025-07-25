import { useState } from 'react'
import { useSession, usersQueryKey } from '@/api/adminApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
import { useQueryClient } from '@tanstack/react-query'
import {
  EllipsisVerticalIcon,
  UserPenIcon,
  UserRoundCheckIcon,
  UserRoundCogIcon,
  UserXIcon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type UserAction = {
  userId: string
  userRole: string
  userBanned: boolean
}

export function AdminActionButton({
  userId,
  userRole,
  userBanned,
}: UserAction) {
  const queryClient = useQueryClient()
  const [openChangeRole, setOpenChangeRole] = useState(false)
  const [openImpersonate, setOpenImpersonate] = useState(false)
  const [openBanUser, setOpenBanUser] = useState(false)

  const { refetch } = useSession()

  const handleChangeRole = async () => {
    const newRole = userRole === 'rental' ? 'user' : 'rental'
    await authClient.admin.setRole({
      userId,
      role: newRole,
      fetchOptions: {
        onSuccess: () => {
          toast.success('Role changed successfully')
        },
        onError: (ctx) => {
          toast.error(ctx.error.message ?? 'An error occurred')
        },
      },
    })

    await queryClient.invalidateQueries({
      queryKey: usersQueryKey.all,
      refetchType: 'active',
    })

    setOpenChangeRole(false)
  }

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

  const handleBanUser = async () => {
    if (userBanned) {
      await authClient.admin.unbanUser({
        userId,
        fetchOptions: {
          onSuccess: () => {
            toast.info('User unbanned successfully')
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? 'An error occurred')
          },
        },
      })
      toast.info('User unbanned successfully')
    } else {
      await authClient.admin.banUser({
        userId,
        banExpiresIn: 60 * 60 * 24 * 1, // 1 day
        fetchOptions: {
          onSuccess: () => {
            toast.success('User banned successfully (1 day)')
          },
          onError: (ctx) => {
            toast.error(ctx.error.message ?? 'An error occurred')
          },
        },
      })
    }

    await queryClient.invalidateQueries({
      queryKey: usersQueryKey.all,
      refetchType: 'active',
    })
  }

  return (
    <>
      <DropdownMenu>
        <ResponsiveAlertDialog
          title={`Are you want to change the role to ${
            userRole === 'rental' ? 'user' : 'rental'
          }?`}
          description={`By changing the role to${' '}${
            userRole === 'rental' ? 'user' : 'rental'
          }, the user will have different permissions.`}
          onClick={handleChangeRole}
          open={openChangeRole}
          setOpen={setOpenChangeRole}
        />
        <ResponsiveAlertDialog
          title="Are you sure you want to impersonate this user?"
          description="Impersonating this user will log you out and log in as this user. You may need to refresh the page to see the changes."
          onClick={handleImpersonateUser}
          open={openImpersonate}
          setOpen={setOpenImpersonate}
        />
        <ResponsiveAlertDialog
          title={`Are you want to${' '}${
            userBanned ? 'unban' : 'ban'
          }  this user?`}
          description={`This user will be ${''}${
            userBanned ? 'unban' : 'ban '
          }${userBanned ? '' : 'for 1 day'}.`}
          onClick={handleBanUser}
          open={openBanUser}
          setOpen={setOpenBanUser}
        />
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <EllipsisVerticalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Admin Action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenChangeRole(true)}>
            <UserPenIcon />
            Change Role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenImpersonate(true)}>
            <UserRoundCogIcon />
            Impersonate User
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenBanUser(true)}>
            {userBanned ? <UserRoundCheckIcon /> : <UserXIcon />}
            {userBanned ? 'Unban User' : 'Ban User'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

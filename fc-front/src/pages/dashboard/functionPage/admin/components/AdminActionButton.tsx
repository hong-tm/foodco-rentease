import { useState } from 'react'
import { useSession, usersQueryKey } from '@/api/adminApi'
import { ResponsiveAlertDialog } from '@/pages/dashboard/components/ResponsiveAlertDialog'
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
  userRole?: string
  userBanned?: boolean | null
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

  const nextRole = userRole === 'rental' ? 'user' : 'rental'

  const handleChangeRole = async () => {
    await authClient.admin.setRole({
      userId,
      role: nextRole,
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
          title={`Change this account to ${nextRole}?`}
          description={`The account keeps its data. Permissions change to the ${nextRole} role.`}
          confirmLabel="Change role"
          onClick={handleChangeRole}
          open={openChangeRole}
          setOpen={setOpenChangeRole}
        />
        <ResponsiveAlertDialog
          title="Sign in as this account?"
          description="Your admin session ends and this account's dashboard opens. Sign out afterwards to return."
          confirmLabel="Impersonate"
          onClick={handleImpersonateUser}
          open={openImpersonate}
          setOpen={setOpenImpersonate}
        />
        <ResponsiveAlertDialog
          title={
            userBanned
              ? 'Remove the ban on this account?'
              : 'Ban this account for 1 day?'
          }
          description={
            userBanned
              ? 'The account can sign in again immediately.'
              : 'The account cannot sign in until the ban expires.'
          }
          confirmLabel={userBanned ? 'Unban account' : 'Ban account'}
          onClick={handleBanUser}
          open={openBanUser}
          setOpen={setOpenBanUser}
        />
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            Manage
            <ChevronDownIcon aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Account action</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setOpenChangeRole(true)}>
            <UserPenIcon />
            Change role
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenImpersonate(true)}>
            <UserRoundCogIcon />
            Impersonate user
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpenBanUser(true)}>
            {userBanned ? <UserRoundCheckIcon /> : <UserXIcon />}
            {userBanned ? 'Unban user' : 'Ban user'}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}

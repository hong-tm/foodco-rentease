import * as React from 'react'
import { useEffect, useState } from 'react'
import { useSession } from '@/api/adminApi'
import { getAllNotificationQueryOptions } from '@/api/notificationApi'
import { NavMain } from '@/pages/dashboard/components/nav-main'
import { NavSecondary } from '@/pages/dashboard/components/nav-secondary'
import { NavUser } from '@/pages/dashboard/components/nav-user'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  CalendarClockIcon,
  ChartAreaIcon,
  CreditCardIcon,
  FileDownIcon,
  ReceiptTextIcon,
  SendIcon,
  ShieldCheckIcon,
  SignatureIcon,
  StoreIcon,
  UsersIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { authClient } from '@/lib/auth-client'

import { Button } from '@/components/ui/button'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
} from '@/components/ui/sidebar'
import { RentEaseMark } from '@/components/rentease-mark'

type Role = 'admin' | 'user' | 'rental'

export type User = {
  id: string
  name: string
  email: string
  role: Role
  image?: string
}

type UserSession = {
  impersonatedBy?: boolean
}

type SessionData = {
  user: User
  session: UserSession
}

export default function UserDashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const queryClient = useQueryClient()
  const { data: session, isLoading, error, refetch } = useSession()
  const [currentSession, setCurrentSession] = useState<SessionData | null>(null)

  const navigate = useNavigate()

  // A count on the nav only for the queue that needs a reply.
  const { data: notifications } = useQuery({
    ...getAllNotificationQueryOptions,
    enabled: session?.user?.role === 'admin',
  })
  const pendingAppointments =
    notifications?.filter((n) => n.notificationRead === null).length ?? 0

  useEffect(() => {
    if (session?.user) {
      const typedSession: SessionData = {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role as Role,
          image: session.user.image === null ? undefined : session.user.image,
        },
        session: {
          impersonatedBy: session.session?.impersonatedBy ? true : false,
        },
      }
      setCurrentSession(typedSession)
    }
  }, [session])

  // Handle showing toast for errors or unavailable user data
  useEffect(() => {
    if (error) {
      toast.error('An error occurred: ' + error)
    } else if (!isLoading && !session) {
      toast.error('User data is unavailable.')
    }
  }, [error, session, isLoading])

  const stopImpersonUser = async () => {
    try {
      await authClient.admin.stopImpersonating()
      // Optimistically update the session data
      queryClient.setQueryData(
        ['user-session'],
        (oldData: { session: { impersonatedBy: boolean } } | undefined) => {
          if (oldData) {
            return {
              ...oldData,
              session: { ...oldData.session, impersonatedBy: false },
            }
          }
          return oldData
        },
      )

      // Optionally, refetch session if necessary
      await refetch()

      toast.success('Impersonation stopped successfully.')
      navigate({ to: '/dashboard/admin', replace: true })
    } catch (error) {
      toast.error('Failed to stop impersonating user: ' + error)
    }
  }

  if (isLoading)
    return (
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {Array.from({ length: 5 }).map((_, index) => (
              <SidebarMenuItem key={index}>
                <SidebarMenuSkeleton showIcon />
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
    )
  if (error) return (toast.error('An error occurred: ' + error), null)

  if (!currentSession || !currentSession.user) {
    return null // Already handle the toast in the effect hook
  }

  const currentSessionData = currentSession || {}
  const user = currentSessionData.user
  const userSession = currentSessionData.session

  const userName = user.name || 'Unknown User'
  const userRole = user.role || 'Unknown Role'
  const userAvatar = user.image || '/default-avatar.png'
  const userEmail = user.email || 'No Email'
  const userImpernate = userSession.impersonatedBy || false

  // Preload user avatar image
  preloadImage(userAvatar)

  function preloadImage(url: string) {
    const img = new Image()
    img.src = url
  }

  const impersonateButton = userImpernate ? (
    <Button
      onClick={stopImpersonUser}
      variant="destructive"
      className="my-2 w-full"
    >
      Stop Impersonating
    </Button>
  ) : null

  const account = { name: userName, email: userEmail, avatar: userAvatar }

  const data = {
    admin: {
      user: account,
      navMain: [
        {
          title: 'Dashboard',
          items: [
            {
              title: 'Overview',
              url: '/dashboard/admin-dashboard',
              icon: ChartAreaIcon,
            },
          ],
        },
        {
          title: 'Stalls',
          items: [
            {
              title: 'Stall availability',
              url: '/dashboard/stall-availability',
              icon: StoreIcon,
            },
            {
              title: 'Stall appointments',
              url: '/dashboard/admin-appointment',
              icon: CalendarClockIcon,
              badge: pendingAppointments,
            },
          ],
        },
        {
          title: 'People',
          items: [
            {
              title: 'Tenants',
              url: '/dashboard/tenant-information',
              icon: UsersIcon,
            },
            {
              title: 'Utilities',
              url: '/dashboard/stall-payment',
              icon: ReceiptTextIcon,
            },
          ],
        },
        {
          title: 'Financial',
          items: [
            {
              title: 'Financial report',
              url: '/dashboard/admin-report',
              icon: FileDownIcon,
            },
          ],
        },
      ],
      navSecondary: [
        { title: 'Admin', url: '/dashboard/admin', icon: ShieldCheckIcon },
        { title: 'Feedback', url: '/dashboard/feedback', icon: SendIcon },
      ],
    },
    rental: {
      user: account,
      navMain: [
        {
          title: 'Stall',
          items: [
            {
              title: 'Stall Information',
              url: '/dashboard/rental-dashboard',
              icon: StoreIcon,
            },
            {
              title: 'Stall Payment',
              url: '/dashboard/stall-utilities',
              icon: ReceiptTextIcon,
            },
          ],
        },
        {
          title: 'New Stall',
          items: [
            {
              title: 'Apply New Stall',
              url: '/dashboard/stall-availability',
              icon: SignatureIcon,
            },
            {
              title: 'Appointment',
              url: '/dashboard/user-appointment',
              icon: CalendarClockIcon,
            },
          ],
        },
        {
          title: 'Financial',
          items: [
            {
              title: 'Export Financial Report',
              url: '/dashboard/rental-report',
              icon: FileDownIcon,
            },
          ],
        },
      ],
      navSecondary: [],
    },
    user: {
      user: account,
      navMain: [
        {
          title: 'Main Features',
          items: [
            {
              title: 'Apply Stall',
              url: '/dashboard/stall-availability',
              icon: SignatureIcon,
            },
            {
              title: 'Appointment',
              url: '/dashboard/user-appointment',
              icon: CalendarClockIcon,
            },
          ],
        },
        {
          title: 'Financial',
          items: [
            {
              title: 'Payments',
              url: '/dashboard/user-report',
              icon: CreditCardIcon,
            },
          ],
        },
      ],
      navSecondary: [],
    },
  }

  const currentRole = (userRole as Role) || 'user'

  return (
    <Sidebar collapsible="icon" variant="sidebar" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent active:bg-transparent"
            >
              <Link to="/dashboard">
                <span className="size-8 shrink-0">
                  <RentEaseMark className="size-full" />
                </span>
                <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="type-strong text-foreground truncate">
                    FoodCo RentEase
                  </span>
                  <span className="type-meta text-muted-foreground truncate capitalize">
                    {userRole} workspace
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
            {impersonateButton ? (
              <SidebarMenuButton asChild>{impersonateButton}</SidebarMenuButton>
            ) : null}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0 [scrollbar-color:--alpha(var(--foreground)/20)_transparent] [scrollbar-width:thin]">
        <NavMain items={data[currentRole]?.navMain || []} />
        <NavSecondary
          items={data[currentRole]?.navSecondary}
          className="mt-auto"
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data[currentRole]?.user} />
      </SidebarFooter>
    </Sidebar>
  )
}

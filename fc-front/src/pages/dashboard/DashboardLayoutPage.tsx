import { useSession } from '@/api/adminApi'
import Cookies from 'js-cookie'
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { toast } from 'sonner'

import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ModeToggle } from '@/components/mode-toggle'

import { DashboardSkeleton } from './components/DashboardSkeleton'
import UserDashboardSidebar from './components/UserDashboardSidebar'
import Breadcrumbs from './components/breadcrumbs'
import { CommandMenu } from './components/command-menu'
import { navByRole, type Role } from './components/nav-data'

const pagesByRole = Object.fromEntries(
  (Object.keys(navByRole) as Role[]).map((role) => {
    const nav = navByRole[role]
    const urls = [
      ...nav.main.flatMap((section) => section.items),
      ...nav.secondary,
      ...nav.quick,
    ]
    return [role, new Set(urls.map((item) => item.url))]
  }),
) as Record<Role, Set<string>>

const knownPages = new Set(
  Object.values(pagesByRole).flatMap((urls) => [...urls]),
)
const homeOf = (role: Role) =>
  navByRole[role].main[0]?.items[0]?.url ?? '/dashboard'

export function DashboardLayoutPage() {
  const location = useLocation()
  const sidebarStateCookie = Cookies.get('sidebar_state')
  const defaultOpen = sidebarStateCookie !== 'false'

  const { data: session, isLoading, error } = useSession()

  // Handle loading state
  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <UserDashboardSidebar />
        <SidebarInset className="min-w-0">
          <DashboardTopBar />
          <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-4 px-4 pt-2 pb-8 md:px-8">
            <DashboardSkeleton />
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  // Handle error or no session
  if (error || !session) {
    toast.error('You are not logged in, please login to continue')
    return <Navigate to="/" replace />
  }

  // Handle role-based redirects when at /dashboard root
  if (location.pathname === '/dashboard') {
    const userRole = session?.user?.role
    switch (userRole) {
      case 'admin':
        return <Navigate to="/dashboard/admin-dashboard" replace />
      case 'rental':
        return <Navigate to="/dashboard/rental-dashboard" replace />
      case 'user':
        return <Navigate to="/dashboard/stall-availability" replace />
      default:
        toast.error('Unknown role')
      // Fall through to render dashboard with error
    }
  }

  // A page outside the account's own navigation goes back to its first page.
  const role = session?.user?.role as Role | undefined
  const allowedPages = role ? pagesByRole[role] : undefined
  if (
    allowedPages &&
    knownPages.has(location.pathname) &&
    !allowedPages.has(location.pathname)
  ) {
    return <Navigate to={homeOf(role as Role)} replace />
  }

  // Render the dashboard for authenticated users
  return (
    <SidebarProvider>
      <UserDashboardSidebar />
      <SidebarInset className="min-w-0">
        <DashboardTopBar />
        <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-1 flex-col gap-4 px-4 pt-2 pb-8 md:px-8">
          <ErrorBoundary
            fallback={
              <div className="p-2">
                Something went wrong, please refresh the page ...
              </div>
            }
          >
            <Outlet />
          </ErrorBoundary>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

function DashboardTopBar() {
  return (
    <header className="bg-background sticky top-0 z-20 flex h-12 shrink-0 items-center justify-between gap-2 px-4 md:px-8">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger className="-ml-2" />
        <Separator orientation="vertical" className="mr-1 h-4!" />
        <Breadcrumbs />
      </div>
      <div className="flex items-center gap-2">
        <CommandMenu />
        <ModeToggle />
      </div>
    </header>
  )
}

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

import Breadcrumbs from './components/Breadcrumbs'
import { DashboardSkeleton } from './components/DashboardSkeleton'
import UserDashboardSidebar from './components/UserDashboardSidebar'

export function DashboardLayoutPage() {
  const location = useLocation()
  const sidebarStateCookie = Cookies.get('sidebar_state')
  const defaultOpen = sidebarStateCookie === 'true'

  const { data: session, isLoading, error } = useSession()

  // Handle loading state
  if (isLoading) {
    return (
      <SidebarProvider defaultOpen={defaultOpen}>
        <UserDashboardSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <ModeToggle />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumbs />
            </div>
          </header>
          <main className="flex h-full w-full flex-1 flex-col gap-4 p-4 pt-0">
            <DashboardSkeleton />
          </main>
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

  // Render the dashboard for authenticated users
  return (
    <SidebarProvider>
      <UserDashboardSidebar />
      <SidebarInset>
        <header className="bg-background sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-2 rounded-t-xl">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <ModeToggle />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumbs />
          </div>
        </header>
        <main className="flex h-full w-full flex-1 flex-col gap-4 p-4 pt-0">
          <ErrorBoundary
            fallback={
              <div className="p-2">
                Something went wrong, please refresh the page ...
              </div>
            }
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

import { SidebarMenuSkeleton } from '@/components/ui/sidebar'
import { SidebarMenuItem } from '@/components/ui/sidebar'
import { SidebarMenu } from '@/components/ui/sidebar'

export function DashboardSkeleton() {
  return (
    <SidebarMenu>
      {Array.from({ length: 8 }).map((_, index) => (
        <SidebarMenuItem key={index}>
          <SidebarMenuSkeleton />
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}

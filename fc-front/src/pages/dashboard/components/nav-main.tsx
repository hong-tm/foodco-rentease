import { Link, useLocation } from '@tanstack/react-router'
import { type LucideIcon } from 'lucide-react'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'

import type { AppPath } from './nav-data'

export function NavMain({
  items,
}: {
  items: {
    title: string
    items: {
      title: string
      url: AppPath
      icon: LucideIcon
      badge?: number
    }[]
  }[]
}) {
  const { pathname } = useLocation()
  const { isMobile, setOpenMobile } = useSidebar()

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.title} className="py-1.5">
          <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={pathname === item.url}
                >
                  <Link
                    to={item.url}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
                {item.badge ? (
                  <SidebarMenuBadge className="bg-brand-soft text-brand-ink rounded-full">
                    {item.badge}
                  </SidebarMenuBadge>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  )
}

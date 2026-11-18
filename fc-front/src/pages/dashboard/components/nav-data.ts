import type { FileRouteTypes } from '@/routeTree.gen'
import {
  BadgeDollarSignIcon,
  BellElectricIcon,
  BookDownIcon,
  CalendarClockIcon,
  CreditCardIcon,
  FileUserIcon,
  GaugeIcon,
  HistoryIcon,
  HousePlusIcon,
  LayoutGridIcon,
  ReceiptTextIcon,
  ScrollIcon,
  SendIcon,
  ShieldCheckIcon,
  StoreIcon,
  UsersIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react'

export type Role = 'admin' | 'user' | 'rental'

/** A path the router knows; a typo in the nav fails the typecheck. */
export type AppPath = FileRouteTypes['to']

export type NavLinkItem = { title: string; url: AppPath; icon: LucideIcon }
export type NavSection = { title: string; items: NavLinkItem[] }

export type RoleNav = {
  main: NavSection[]
  secondary: NavLinkItem[]
  quick: NavLinkItem[]
}

export const navByRole: Record<Role, RoleNav> = {
  admin: {
    main: [
      {
        title: 'Dashboard',
        items: [
          {
            title: 'Overview',
            url: '/dashboard/admin-dashboard',
            icon: GaugeIcon,
          },
        ],
      },
      {
        title: 'Stall',
        items: [
          {
            title: 'Stall Availability',
            url: '/dashboard/stall-availability',
            icon: LayoutGridIcon,
          },
          {
            title: 'Stall Appointments',
            url: '/dashboard/admin-appointment',
            icon: CalendarClockIcon,
          },
        ],
      },
      {
        title: 'Tenant',
        items: [
          {
            title: 'Tenant Information',
            url: '/dashboard/tenant-information',
            icon: UsersIcon,
          },
          {
            title: 'Utilities',
            url: '/dashboard/stall-payment',
            icon: ZapIcon,
          },
        ],
      },
      {
        title: 'Financial',
        items: [
          {
            title: 'Financial report',
            url: '/dashboard/admin-report',
            icon: BadgeDollarSignIcon,
          },
        ],
      },
    ],
    secondary: [
      { title: 'Admin', url: '/dashboard/admin', icon: ShieldCheckIcon },
      { title: 'Feedback', url: '/dashboard/feedback', icon: SendIcon },
    ],
    quick: [
      {
        title: 'Tenant Information',
        url: '/dashboard/tenant-information',
        icon: BellElectricIcon,
      },
      {
        title: 'Export Report',
        url: '/dashboard/admin-report',
        icon: BookDownIcon,
      },
      {
        title: 'Stall Appointments',
        url: '/dashboard/admin-appointment',
        icon: ScrollIcon,
      },
    ],
  },
  rental: {
    main: [
      {
        title: 'Stall',
        items: [
          {
            title: 'Your stalls',
            url: '/dashboard/rental-dashboard',
            icon: StoreIcon,
          },
          {
            title: 'Utilities',
            url: '/dashboard/stall-utilities',
            icon: ZapIcon,
          },
        ],
      },
      {
        title: 'New Stall',
        items: [
          {
            title: 'Apply New Stall',
            url: '/dashboard/stall-availability',
            icon: LayoutGridIcon,
          },
          {
            title: 'Appointments',
            url: '/dashboard/user-appointment',
            icon: CalendarClockIcon,
          },
        ],
      },
      {
        title: 'Financial',
        items: [
          {
            title: 'Payment records',
            url: '/dashboard/rental-report',
            icon: BadgeDollarSignIcon,
          },
        ],
      },
    ],
    secondary: [],
    quick: [
      {
        title: 'Payment records',
        url: '/dashboard/rental-report',
        icon: CreditCardIcon,
      },
      {
        title: 'Apply New Stall',
        url: '/dashboard/stall-availability',
        icon: HousePlusIcon,
      },
    ],
  },
  user: {
    main: [
      {
        title: 'Main Features',
        items: [
          {
            title: 'Apply Stall',
            url: '/dashboard/stall-availability',
            icon: LayoutGridIcon,
          },
          {
            title: 'Appointments',
            url: '/dashboard/user-appointment',
            icon: CalendarClockIcon,
          },
        ],
      },
      {
        title: 'Financial',
        items: [
          {
            title: 'Payment records',
            url: '/dashboard/user-report',
            icon: ReceiptTextIcon,
          },
        ],
      },
    ],
    secondary: [],
    quick: [
      {
        title: 'Apply Stall',
        url: '/dashboard/stall-availability',
        icon: FileUserIcon,
      },
      {
        title: 'Payment records',
        url: '/dashboard/user-report',
        icon: HistoryIcon,
      },
    ],
  },
}

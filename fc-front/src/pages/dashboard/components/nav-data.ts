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

export type NavLinkItem = { title: string; url: string; icon: LucideIcon }
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
            title: 'Stall Utilities Payment',
            url: '/dashboard/stall-payment',
            icon: ZapIcon,
          },
        ],
      },
      {
        title: 'Financial',
        items: [
          {
            title: 'Export Financial Report',
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
            title: 'Stall Information',
            url: '/dashboard/rental-dashboard',
            icon: StoreIcon,
          },
          {
            title: 'Stall Payment',
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
            icon: BadgeDollarSignIcon,
          },
        ],
      },
    ],
    secondary: [],
    quick: [
      {
        title: 'Payments',
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
        title: 'Payment History',
        url: '/dashboard/user-report',
        icon: HistoryIcon,
      },
    ],
  },
}

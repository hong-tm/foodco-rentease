import {
  BadgeDollarSignIcon,
  BellElectricIcon,
  BookDownIcon,
  ChartAreaIcon,
  CommandIcon,
  CreditCardIcon,
  FileUserIcon,
  HistoryIcon,
  HousePlusIcon,
  ListOrderedIcon,
  ScrollIcon,
  SendIcon,
  ShieldCheckIcon,
  SignatureIcon,
  UsersIcon,
  type LucideIcon,
} from 'lucide-react'

export type NavRole = 'admin' | 'user' | 'rental'

type NavChildItem = {
  title: string
  url: string
}

type NavMainItem = {
  title: string
  url: string
  icon: LucideIcon
  isActive?: boolean
  items?: NavChildItem[]
}

type NavLinkItem = {
  title: string
  url: string
  icon: LucideIcon
}

type NavRoleData = {
  navMain: NavMainItem[]
  navQuick: NavLinkItem[]
  navSecondary: NavLinkItem[]
}

export function getNavData(role: NavRole): NavRoleData {
  switch (role) {
    case 'admin':
      return {
        navMain: [
          {
            title: 'Dashboard',
            url: '/dashboard/admin-dashboard',
            icon: ChartAreaIcon,
            isActive: true,
            items: [
              {
                title: 'Overview',
                url: '/dashboard/admin-dashboard',
              },
            ],
          },
          {
            title: 'Stall',
            url: '/dashboard/stall-availability',
            icon: CommandIcon,
            items: [
              {
                title: 'Stall Availability',
                url: '/dashboard/stall-availability',
              },
              {
                title: 'Stall Appointments',
                url: '/dashboard/admin-appointment',
              },
            ],
          },
          {
            title: 'Tenant',
            url: '/dashboard/tenant-information',
            icon: UsersIcon,
            items: [
              {
                title: 'Tenant Information',
                url: '/dashboard/tenant-information',
              },
              {
                title: 'Stall Payment',
                url: '/dashboard/stall-payment',
              },
            ],
          },
          {
            title: 'Financial',
            url: '#',
            icon: BadgeDollarSignIcon,
            items: [
              {
                title: 'Payments',
                url: '/dashboard/admin-report',
              },
            ],
          },
        ],
        navQuick: [
          {
            title: 'Tenant Information',
            url: '/dashboard/tenant-information',
            icon: BellElectricIcon,
          },
          {
            title: 'Payments',
            url: '/dashboard/admin-report',
            icon: BookDownIcon,
          },
          {
            title: 'Stall Appointments',
            url: '/dashboard/admin-appointment',
            icon: ScrollIcon,
          },
        ],
        navSecondary: [
          {
            title: 'Users',
            url: '/dashboard/admin',
            icon: ShieldCheckIcon,
          },
          {
            title: 'Feedback',
            url: '/dashboard/feedback',
            icon: SendIcon,
          },
        ],
      }
    case 'rental':
      return {
        navMain: [
          {
            title: 'Stall',
            url: '/dashboard/rental-dashboard',
            icon: CommandIcon,
            isActive: true,
            items: [
              {
                title: 'Rental Dashboard',
                url: '/dashboard/rental-dashboard',
              },
              {
                title: 'Stall Utilities',
                url: '/dashboard/stall-utilities',
              },
            ],
          },
          {
            title: 'New Stall',
            url: '#',
            icon: SignatureIcon,
            items: [
              {
                title: 'Apply New Stall',
                url: '/dashboard/stall-availability',
              },
              {
                title: 'User Appointment',
                url: '/dashboard/user-appointment',
              },
            ],
          },
          {
            title: 'Financial',
            url: '#',
            icon: BadgeDollarSignIcon,
            items: [
              {
                title: 'Rental Report',
                url: '/dashboard/rental-report',
              },
            ],
          },
        ],
        navQuick: [
          {
            title: 'Rental Report',
            url: '/dashboard/rental-report',
            icon: CreditCardIcon,
          },
          {
            title: 'Apply New Stall',
            url: '/dashboard/stall-availability',
            icon: HousePlusIcon,
          },
        ],
        navSecondary: [],
      }
    default:
      return {
        navMain: [
          {
            title: 'Main Features',
            url: '/dashboard/stall-availability',
            icon: ListOrderedIcon,
            isActive: true,
            items: [
              {
                title: 'Apply Stall',
                url: '/dashboard/stall-availability',
              },
              {
                title: 'User Appointment',
                url: '/dashboard/user-appointment',
              },
            ],
          },
          {
            title: 'Financial',
            url: '#',
            icon: BadgeDollarSignIcon,
            items: [
              {
                title: 'Payment History',
                url: '/dashboard/user-report',
              },
            ],
          },
        ],
        navQuick: [
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
        navSecondary: [],
      }
  }
}

import type {
  StallAttributes,
  UserAttributes,
  UserStallAttributes,
} from '@server/db/userModel'
import { useQuery } from '@tanstack/react-query'
import type { UseQueryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'

export type GetUsersResponse = {
  users: UserAttributes[]
}

export type GetRentalsResponse = {
  user: UserStallAttributes[]
  stalls: StallAttributes[]
}

export type SendReminderEmailResponse = {
  to: string
  subject: string
  text: string
}

export async function fetchUsers(): Promise<GetUsersResponse> {
  const { data } = await authClient.admin.listUsers({
    query: {
      sortBy: 'name',
    },
    fetchOptions: {
      onError(context) {
        throw new Error(context.error.message || context.error.statusText)
      },
    },
  })

  return data as GetUsersResponse
}

export async function fetchRentals(): Promise<GetRentalsResponse> {
  const res = await api.users['rentals'].$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error)
  }

  const data = await res.json()
  const { user, stalls } = data as GetRentalsResponse

  if (!Array.isArray(user)) throw new Error('Invalid user data format')

  return { user, stalls }
}

export const useSession = () => {
  return useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      const session = await authClient.getSession({
        fetchOptions: {
          onError: (context) => {
            throw new Error(context.error.message || context.error.statusText)
          },
        },
      })
      return session.data
    },
    retry: 1, // Only retry once for session fetching
  })
}

export async function sendReminderEmail({
  to,
  subject,
  text,
}: SendReminderEmailResponse) {
  const res = await api.users['send-reminder-email'].$post({
    json: { to, subject, text },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data
}

// query key
export const usersQueryKey = {
  all: ['user'],
  users: () => [...usersQueryKey.all, 'get-user'],
  rentals: () => [...usersQueryKey.all, 'get-rental'],
}

// QueryOptions
export const fetchUsersQueryOptions: UseQueryOptions<GetUsersResponse> = {
  queryKey: usersQueryKey.users(),
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 1, // 1 minute
}

export const fetchRentalsQueryOptions: UseQueryOptions<GetRentalsResponse> = {
  queryKey: usersQueryKey.rentals(),
  queryFn: fetchRentals,
  staleTime: 1000 * 60 * 1, // 1 minute
}

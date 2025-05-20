import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import {
  StallAttributes,
  UserAttributes,
  UserStallAttributes,
} from '@server/db/userModel'
import { useQuery, UseQueryOptions } from '@tanstack/react-query'

export type GetUsersResponse = {
  users: UserAttributes[]
}

export interface GetRentalsResponse {
  user: UserStallAttributes[]
  stalls: StallAttributes[]
}

export interface SendReminderEmailResponse {
  to: string
  subject: string
  text: string
}

export async function fetchUsers(): Promise<GetUsersResponse> {
  try {
    const response = await authClient.admin.listUsers({
      query: {
        sortBy: 'name',
      },
    })

    if (response.data) {
      return response.data as GetUsersResponse
    }

    throw new Error('No users found')
  } catch (error) {
    console.error('Error fetching users:', error)
    throw error instanceof Error
      ? error
      : new Error(`Failed to fetch users: ${error}`)
  }
}

export async function fetchRentals(): Promise<GetRentalsResponse> {
  const res = await api.users['rentals'].$get()
  if (!res.ok) throw new Error('Failed to fetch rentals')
  const data = await res.json()
  const { user, stalls } = data as GetRentalsResponse
  if (!Array.isArray(user)) throw new Error('Invalid user data format')

  return { user, stalls }
}

export const useSession = () => {
  return useQuery({
    queryKey: ['user-session'],
    queryFn: async () => {
      try {
        const session = await authClient.getSession()
        return session.data
      } catch (error) {
        console.error('Session error:', error)
        throw error
      }
    },
    retry: 1, // Only retry once for session fetching
  })
}

export async function sendReminderEmail({
  to,
  subject,
  text,
}: SendReminderEmailResponse) {
  try {
    const res = await api.users['send-reminder-email'].$post({
      json: { to, subject, text },
    })

    if (!res.ok) {
      const errorBody = await res.json()
      console.error('Send email error:', errorBody)
      throw new Error('Failed to send email')
    }
    return res
  } catch (error) {
    console.error('Error in sendReminderEmail:', error)
    throw error
  }
}

// QueryOptions
export const fetchUsersQueryOptions: UseQueryOptions<GetUsersResponse> = {
  queryKey: ['fetch-users'],
  queryFn: fetchUsers,
  staleTime: 1000 * 60 * 1, // 1 minute
}

export const fetchRentalsQueryOptions: UseQueryOptions<GetRentalsResponse> = {
  queryKey: ['fetch-rentals'],
  queryFn: fetchRentals,
  staleTime: 1000 * 60 * 1, // 1 minute
}

import type {
  NotificationAttributes,
  UserAttributes,
} from '@server/db/userModel'
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from '@server/lib/sharedType'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod/v4'

import { api } from '@/lib/api'

export type NotificationResponse = {
  notification: NotificationAttributes[] // Assuming your feedback array is of type 'Feedback'
  userId: UserAttributes[]
}

type AppointmentData = z.infer<typeof createAppointmentSchema>

type UpdateAppointmentStatusData = z.infer<typeof updateAppointmentStatusSchema>

export async function createAppointment(values: AppointmentData) {
  const res = await api.notifications['$post']({ json: values })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  return res.json()
}

export async function updateAppointmentStatus(
  values: UpdateAppointmentStatusData,
) {
  const res = await api.notifications['update-appoitmentStatus'].$post({
    json: values,
  })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.notification
}

export async function fetchNotifications() {
  const res = await api.notifications.$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.notification as NotificationAttributes[]
}

export async function fetchUserNotifications(userId: string) {
  const res = await api.notifications[':userId'].$get({
    param: { userId },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.notification as NotificationAttributes[]
}

// query-keys
export const notificationsQueryKey = {
  all: ['notification'],
  notifications: () => [...notificationsQueryKey.all, 'get-notification'],
  listByFilter: (filter: { archived: boolean }) => [
    ...notificationsQueryKey.notifications(),
    filter,
  ],
  findByDepartment: (department: string) => [
    ...notificationsQueryKey.all,
    department,
  ],
  userNotifications: () => [
    ...notificationsQueryKey.all,
    'get-user-notifications',
  ],
}

// QueryOptions
export const getAllNotificationQueryOptions = queryOptions<
  NotificationAttributes[]
>({
  queryKey: notificationsQueryKey.notifications(),
  queryFn: fetchNotifications,
  staleTime: 1000 * 60 * 1, // 1 minutes
})

export const getUserNotificationQueryOptions = queryOptions<
  NotificationAttributes[]
>({
  queryKey: notificationsQueryKey.userNotifications(),
  queryFn: ({ queryKey }) => {
    const [, userId] = queryKey
    return fetchUserNotifications(userId as string)
  },
  staleTime: 1000 * 60 * 1, // 1 minutes
})

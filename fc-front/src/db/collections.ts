import {
  feedbacksQueryKey,
  getAllFeedback,
  type Feedback,
} from '@/api/feedbackApi'
import {
  fetchNotifications,
  notificationsQueryKey,
  type NotificationAttributes,
} from '@/api/notificationApi'
import {
  getAllPaymentRecords,
  paymentsQueryKey,
  type PaymentRecord,
} from '@/api/paymentApi'
import {
  fetchStalls,
  stallsQueryKey,
  type GetStallsResponse,
} from '@/api/stallApi'
import { queryCollectionOptions } from '@tanstack/query-db-collection'
import { createCollection, useLiveQuery } from '@tanstack/react-db'

import { queryClient } from '@/lib/query-client'

export const feedbackCollection = createCollection(
  queryCollectionOptions<Feedback>({
    id: 'feedbacks',
    queryKey: feedbacksQueryKey.feedbacks(),
    queryFn: getAllFeedback,
    queryClient,
    getKey: (feedback) => feedback.id,
  }),
)

export const stallsCollection = createCollection(
  queryCollectionOptions<GetStallsResponse['stall'][number]>({
    id: 'stalls',
    queryKey: stallsQueryKey.stalls(),
    queryFn: async () => {
      const response = await fetchStalls()
      return response.stall
    },
    queryClient,
    getKey: (stall) => stall.stallNumber,
  }),
)

export const notificationsCollection = createCollection(
  queryCollectionOptions<NotificationAttributes>({
    id: 'notifications',
    queryKey: notificationsQueryKey.notifications(),
    queryFn: fetchNotifications,
    queryClient,
    getKey: (notification) => notification.notificationId,
  }),
)

export const paymentsCollection = createCollection(
  queryCollectionOptions<PaymentRecord>({
    id: 'payments',
    queryKey: paymentsQueryKey.record(),
    queryFn: getAllPaymentRecords,
    queryClient,
    getKey: (payment) => payment.paymentId,
  }),
)

export function useNotificationRows(enabled = true) {
  const live = useLiveQuery((q) =>
    enabled ? q.from({ n: notificationsCollection }) : undefined,
  )
  const failed = live.status === 'error' || live.status === 'crashed'
  return {
    data: live.isReady ? live.data : undefined,
    isLoading: live.status === 'loading' || live.status === 'idle',
    error: failed ? new Error('Failed to load appointments') : null,
    refetch: () => notificationsCollection.utils.refetch(),
  }
}

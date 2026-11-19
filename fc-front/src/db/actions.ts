import {
  deleteFeedback,
  restoreFeedback,
  type Feedback,
} from '@/api/feedbackApi'
import {
  updateAppointmentStatus,
  type NotificationAttributes,
} from '@/api/notificationApi'
import { feedbackCollection, notificationsCollection } from '@/db/collections'
import { createPacedMutations, queueStrategy } from '@tanstack/react-db'

export type AppointmentDecision = boolean | null

export const decideAppointment = createPacedMutations<
  { id: number; decision: AppointmentDecision },
  NotificationAttributes
>({
  onMutate: ({ id, decision }) => {
    notificationsCollection.update(id, (draft) => {
      draft.notificationRead = decision
    })
  },
  mutationFn: async ({ transaction }) => {
    const rows = transaction.mutations.map((mutation) => mutation.modified)
    for (const row of rows) {
      await updateAppointmentStatus({
        notificationId: row.notificationId,
        notificationRead: row.notificationRead,
        stallNumber: row.stallNumber,
      })
    }
    await notificationsCollection.utils.writeBatch(() => {
      for (const row of rows) notificationsCollection.utils.writeUpdate(row)
    })
  },
  strategy: queueStrategy(),
})

export const changeFeedback = createPacedMutations<
  { kind: 'delete' | 'restore'; feedback: Feedback },
  Feedback
>({
  onMutate: ({ kind, feedback }) => {
    if (kind === 'delete') feedbackCollection.delete(feedback.id)
    else feedbackCollection.insert(feedback)
  },
  mutationFn: async ({ transaction }) => {
    for (const mutation of transaction.mutations) {
      if (mutation.type === 'delete') {
        await deleteFeedback({ id: mutation.key })
        await feedbackCollection.utils.writeDelete(mutation.key)
      } else {
        await restoreFeedback(mutation.modified)
        await feedbackCollection.utils.writeInsert(mutation.modified)
      }
    }
  },
  strategy: queueStrategy(),
})

import { createFeedbackSchema } from '@server/lib/sharedType'
import { queryOptions } from '@tanstack/react-query'
import { z } from 'zod/v4'

import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'

export interface Feedback {
  id: number
  happiness: number // Assuming happiness is an integer (1 to 4)
  stall: number // Stall number
  feedbackContent: string // Feedback text
  createdAt: string // Date of creation
}

export interface FeedbackResponse {
  feedback: Feedback[] // Assuming your feedback array is of type 'Feedback'
}

export interface FeedbackHappinessResponse {
  stallHappiness: {
    stallId: number
    totalHappiness: number
    totalFeedbacks: number
  }[]
}

export async function getAllFeedback(): Promise<Feedback[]> {
  const session = await authClient.getSession()

  const token = session?.data?.session?.token
  if (!token) throw new Error('No token found')

  const res = await api.feedbacks['$get']({
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      credentials: 'include',
    },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  // Cast the response to FeedbackResponse using `as`
  const data = await res.json()
  const { feedback } = data as FeedbackResponse // Type assertion

  if (!Array.isArray(feedback)) {
    throw new Error('Invalid feedback data format')
  }

  return feedback
}

export async function getFeedbackHappiness(): Promise<
  FeedbackHappinessResponse['stallHappiness']
> {
  const res = await api.feedbacks['get-feedbackHappiness'].$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.stallHappiness
}

export async function createFeedback(
  values: z.infer<typeof createFeedbackSchema>,
) {
  const res = await api.feedbacks['$post']({ json: values })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.feedback
}

export async function deleteFeedback({ id }: { id: number }) {
  const res = await api.feedbacks[':id'].$delete({
    param: { id: id.toString() },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.feedback
}

// query key
export const feedbacksQueryKey = {
  all: ['feedback'],
  feedbacks: () => [...feedbacksQueryKey.all, 'get-feedback'],
  happiness: () => [...feedbacksQueryKey.all, 'get-happiness'],
}

// QueryOptions
export const getAllFeedbackQueryOptions = queryOptions<Feedback[]>({
  queryKey: feedbacksQueryKey.feedbacks(),
  queryFn: getAllFeedback,
  staleTime: 1000 * 60 * 1, // 1 minutes
  // refetchInterval: 5000, // Refetch every 5 seconds
})

export const getFeedbackHappinessQueryOptions = queryOptions<
  FeedbackHappinessResponse['stallHappiness']
>({
  queryKey: feedbacksQueryKey.happiness(),
  queryFn: getFeedbackHappiness,
  staleTime: 1000 * 60 * 1, // 1 minutes
})

export function removeFeedbackById(
  feedbacks: Feedback[] | undefined,
  id: number,
): Feedback[] {
  return feedbacks ? feedbacks.filter((feedback) => feedback.id !== id) : []
}

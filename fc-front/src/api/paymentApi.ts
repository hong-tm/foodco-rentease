import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'
import { queryOptions } from '@tanstack/react-query'
import { loadStripe } from '@stripe/stripe-js'
import type {
  PaymentRecord,
  PaymentIntentResponse,
  PaymentIntentRequest,
  CreatePaymentRecordRequest,
  CreatePaymentUtilityRequest,
  // UpdatePaymentStatusRequest,
} from '@server/lib/sharedType'

// Stripe initialization
export const stripePromise = loadStripe(
  'pk_test_51Q0PgoRs6oUNWmV9hY185GXM1BsHqXDjJyvzQVfXtBtc5AFsIyGt4Fm5tDO27Y81CfA0WjfA2jUesfYy6rvvncyi00dzTzDXSX',
  {
    apiVersion: '2024-12-18.acacia',
  },
)

// API Functions
export async function getAllPaymentRecords(): Promise<PaymentRecord[]> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token

  if (!token) throw new Error('No token found')

  const res = await api.payments.records.$get()

  if (!res.ok) {
    throw new Error('Failed to fetch payment records')
  }

  const data = (await res.json()) as PaymentRecord[]
  return data
}

export async function createPaymentIntent(
  amount: number,
  stallId: number,
  userId: string,
): Promise<PaymentIntentResponse> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token

  if (!token) throw new Error('No token found')

  const payload: PaymentIntentRequest = {
    amount: Number(amount),
    stallId: Number(stallId),
    userId: userId,
  }

  const res = await api.payments['create-payment-intent'].$post({
    json: payload,
  })

  if (!res.ok) {
    const error = (await res.json()) as { error: string }
    throw new Error(error.error || 'Failed to create payment intent')
  }

  const data = (await res.json()) as PaymentIntentResponse
  return data
}

export async function createPaymentRecord(
  data: CreatePaymentRecordRequest,
): Promise<PaymentRecord> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token

  if (!token) throw new Error('No token found')

  const res = await api.payments['create-record'].$post({
    json: data,
  })

  if (!res.ok) {
    const error = (await res.json()) as { error: string }
    throw new Error(error.error || 'Failed to create payment record')
  }

  const responseData = (await res.json()) as PaymentRecord
  return responseData
}

export const updatePaymentStatus = async ({
  paymentId,
  newPaymentId,
  paymentStatus,
}: {
  paymentId: string
  newPaymentId: string
  paymentStatus: boolean
}): Promise<UpdatePaymentStatusResponse> => {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token

  if (!token) throw new Error('No token found')

  const res = await api.payments['update-payment-status'].$post({
    json: {
      paymentId,
      newPaymentId,
      paymentStatus,
    },
  })

  const data: UpdatePaymentStatusResponse = await res.json()

  if (!res.ok) {
    console.error('Update payment status error:', data)
    if ('error' in data) {
      throw new Error(data.error)
    }
    throw new Error('Failed to update payment status')
  }

  return data
}

export async function createUtilityPaymentRecord(
  data: CreatePaymentUtilityRequest,
): Promise<PaymentRecord> {
  const session = await authClient.getSession()
  const token = session?.data?.session?.token

  if (!token) throw new Error('No token found')

  const res = await api.payments['create-utility-payment'].$post({
    json: data,
  })

  if (!res.ok) {
    const error = (await res.json()) as { error: string }
    throw new Error(error.error || 'Failed to create utility payment record')
  }

  const responseData = (await res.json()) as PaymentRecord
  return responseData
}

// Query Options
export const getAllPaymentRecordsQueryOptions = queryOptions<PaymentRecord[]>({
  queryKey: ['get-payment-records'],
  queryFn: getAllPaymentRecords,
  staleTime: 1000 * 60 * 1, // 1 minute
})

// Helper Functions
export function removePaymentRecordById(
  records: PaymentRecord[] | undefined,
  id: string,
): PaymentRecord[] {
  return records ? records.filter((record) => record.paymentId !== id) : []
}

type UpdatePaymentStatusResponse =
  | {
      success: boolean
      payment: any
    }
  | {
      error: string
    }

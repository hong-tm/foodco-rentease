import type {
  CreatePaymentRecordRequest,
  CreatePaymentUtilityRequest,
  PaymentIntentRequest,
  PaymentIntentResponse,
  PaymentRecord,
  // UpdatePaymentStatusRequest,
} from '@server/lib/sharedType'
import { loadStripe } from '@stripe/stripe-js'
import { queryOptions } from '@tanstack/react-query'

import { api } from '@/lib/api'
import { authClient } from '@/lib/auth-client'

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
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data as PaymentRecord[]
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
    const data = await res.json()
    throw new Error(data.message)
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
    const data = await res.json()
    throw new Error(data.message)
  }

  const responseData = await res.json()

  return {
    ...responseData,
    paymentDate: new Date(responseData.paymentDate),
  }
}

export const updatePaymentStatus = async ({
  paymentId,
  newPaymentId,
  paymentStatus,
}: {
  paymentId: string
  newPaymentId: string
  paymentStatus: boolean
}) => {
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

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
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
    const data = await res.json()
    throw new Error(data.message)
  }

  const responseData = await res.json()
  return responseData.payment as PaymentRecord
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

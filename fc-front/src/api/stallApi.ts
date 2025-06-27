import {
  StallTierAttributes,
  StallUserAttributes,
  UserAttributes,
} from '@server/db/userModel'
import { updateStallSchema } from '@server/lib/sharedType'
import { UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod/v4'

import { api } from '@/lib/api'

export interface GetStallsResponse {
  stall: StallUserAttributes[]
  users: UserAttributes[]
}

export interface GetCurrentVacancyResponse {
  totalStalls: number
  stalls: StallUserAttributes[]
}

export interface GetStallCurrentResponse {
  stalls: StallUserAttributes[]
  user: UserAttributes
}

export type StallFormProps = {
  stall: StallUserAttributes
  onSubmit?: (data: any) => void
  setOpenDialog?: (open: boolean) => void
}

export type StallButtonProps = {
  stall: StallUserAttributes
  onOpen: (stallId: string | null) => void
  isOpen: boolean
}

export interface GetStallTierPricesResponse {
  tierPrice: StallTierAttributes[]
}

// Function

export async function fetchStalls(): Promise<GetStallsResponse> {
  const res = await api.stalls.$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data as GetStallsResponse
}

export async function fetchStallCurrent(
  stallId: string,
): Promise<GetStallCurrentResponse> {
  const res = await api.stalls[':stallOwner'].$get({
    param: { stallOwner: stallId },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data as GetStallCurrentResponse
}

export async function fetchCurrentVacancy(): Promise<GetCurrentVacancyResponse> {
  const res = await api.stalls.$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()

  // Calculate total stalls
  const totalStalls = data.stall.length

  return {
    totalStalls,
    stalls: data.stall,
  } as GetCurrentVacancyResponse
}

export async function fetchStallTierPrices(): Promise<GetStallTierPricesResponse> {
  const res = await api.stalls.tierPrices.$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return { tierPrice: data.tierPrice } as GetStallTierPricesResponse
}

export async function updateStall(values: z.infer<typeof updateStallSchema>) {
  const { stallNumber, ...restOfValues } = values
  const stallId = stallNumber?.toString()

  if (!restOfValues) {
    throw new Error('No values to update')
  }

  if (!stallId) {
    throw new Error('Stall ID is required')
  }

  const res = await api.stalls[':stallId'].$post({
    json: values,
    param: { stallId },
  })

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data
}

// QueryOptions
export const fetchStallsQueryOptions: UseQueryOptions<GetStallsResponse> = {
  queryKey: ['fetch-stalls'],
  queryFn: fetchStalls,
  staleTime: 1000 * 60 * 1, // Cache for 1 minute
}

export const fetchCurrentVacancyQueryOptions: UseQueryOptions<GetCurrentVacancyResponse> =
  {
    queryKey: ['fetch-current-vacancy'],
    queryFn: fetchCurrentVacancy,
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
  }

export const fetchStallTierPricesQueryOptions: UseQueryOptions<GetStallTierPricesResponse> =
  {
    queryKey: ['fetch-stall-tier-prices'],
    queryFn: fetchStallTierPrices,
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
  }

export const fetchStallCurrentQueryOptions = (
  stallId: string,
): UseQueryOptions<GetStallCurrentResponse> => ({
  queryKey: ['fetch-stall-current', stallId],
  queryFn: () => fetchStallCurrent(stallId),
  staleTime: 1000 * 60 * 1, // Cache for 1 minute
})

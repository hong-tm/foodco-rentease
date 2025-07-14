import type {
  StallTierAttributes,
  StallUserAttributes,
  UserAttributes,
} from '@server/db/userModel'
import { updateStallSchema } from '@server/lib/sharedType'
import type { UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod/v4'

import { api } from '@/lib/api'

export type GetStallsResponse = {
  stall: StallUserAttributes[]
}

export type GetCurrentVacancyResponse = {
  totalStalls: number
  stalls: StallUserAttributes[]
}

export type GetStallCurrentResponse = {
  stalls: StallUserAttributes[]
  user: UserAttributes
}

export type StallFormProps = {
  stall: StallUserAttributes
  onSubmit?: (data: unknown) => void
  setOpenDialog?: (open: boolean) => void
}

export type StallButtonProps = {
  stall: StallUserAttributes
  onOpen: (stallId: string | null) => void
  isOpen: boolean
}

// Function

export async function fetchStalls(): Promise<GetStallsResponse> {
  const res = await api.stalls.$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return {
    stall: data.stall as StallUserAttributes[],
  }
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
  return {
    stalls: data.stalls as StallUserAttributes[],
    user: data.user as UserAttributes,
  }
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

export async function fetchStallTierPrices(): Promise<StallTierAttributes[]> {
  const res = await api.stalls.tierPrices.$get()

  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.message)
  }

  const data = await res.json()
  return data.tierPrice
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

// query-keys
export const stallsQueryKey = {
  all: ['stall'],
  stalls: () => [...stallsQueryKey.all, 'get-stall'],
  findByStallId: (stallId: string) => [...stallsQueryKey.all, stallId],
  getVacancy: () => [...stallsQueryKey.all, 'get-vacancy'],
  getTiers: () => [...stallsQueryKey.all, 'get-tier'],
}

// QueryOptions
export const fetchStallsQueryOptions: UseQueryOptions<GetStallsResponse> = {
  queryKey: stallsQueryKey.stalls(),
  queryFn: fetchStalls,
  staleTime: 1000 * 60 * 1, // Cache for 1 minute
}

export const fetchCurrentVacancyQueryOptions: UseQueryOptions<GetCurrentVacancyResponse> =
  {
    queryKey: stallsQueryKey.getVacancy(),
    queryFn: fetchCurrentVacancy,
    staleTime: 1000 * 60 * 1, // Cache for 1 minute
  }

export const fetchStallTierPricesQueryOptions: UseQueryOptions<
  StallTierAttributes[]
> = {
  queryKey: stallsQueryKey.getTiers(),
  queryFn: fetchStallTierPrices,
  staleTime: 1000 * 60 * 1, // Cache for 1 minute
}

export const fetchStallCurrentQueryOptions = (
  stallId: string,
): UseQueryOptions<GetStallCurrentResponse> => ({
  queryKey: stallsQueryKey.findByStallId(stallId),
  queryFn: () => fetchStallCurrent(stallId),
  staleTime: 1000 * 60 * 1, // Cache for 1 minute
})

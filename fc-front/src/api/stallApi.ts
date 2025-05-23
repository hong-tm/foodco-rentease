import { api } from '@/lib/api'
import {
  StallTierAttributes,
  StallUserAttributes,
  UserAttributes,
} from '@server/db/userModel'
import { updateStallSchema } from '@server/lib/sharedType'
import { UseQueryOptions } from '@tanstack/react-query'
import { z } from 'zod'

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
  const Response = await api.stalls.$get()

  if (!Response.ok) throw new Error('Failed to fetch stalls')

  const data = await Response.json()
  const { stall } = data as GetStallsResponse
  return { stall, users: [] }
}

export async function fetchStallCurrent(
  stallId: string,
): Promise<GetStallCurrentResponse> {
  const Response = await api.stalls[':stallOwner'].$get({
    param: { stallOwner: stallId },
  })

  if (!Response.ok) throw new Error('Failed to fetch stall')
  const data = await Response.json()
  return data as GetStallCurrentResponse
}

export async function fetchCurrentVacancy(): Promise<GetCurrentVacancyResponse> {
  const Response = await api.stalls.$get()

  if (!Response.ok) throw new Error('Failed to fetch stalls')

  const data = await Response.json()
  const { stall } = data

  // Calculate total stalls
  const totalStalls = stall.length

  return {
    totalStalls,
    stalls: stall,
  } as GetCurrentVacancyResponse
}

export async function fetchStallTierPrices(): Promise<GetStallTierPricesResponse> {
  const Response = await api.stalls.tierPrices.$get()

  if (!Response.ok) throw new Error('Failed to fetch stall tier prices')

  const data = await Response.json()
  return data as GetStallTierPricesResponse
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

  const Response = await api.stalls[':stallId'].$post({
    json: values,
    param: { stallId },
  })

  if (!Response.ok) {
    const errorData = (await Response.json()) as
      | { error: string }
      | { message: string; stall: {} }
    if ('error' in errorData) {
      throw new Error(errorData.error || 'Failed to update stall')
    } else {
      throw new Error(errorData.message || 'Failed to update stall')
    }
  }

  return Response.json()
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

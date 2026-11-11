import type { ApiRoutes } from '@server/index'
import { hc } from 'hono/client'

const client = hc<ApiRoutes>('/')

export const api = client.api

// this is a trick to calculate the type when compiling
// const api = hc<ApiRoutes>('')
// export type Api = typeof api

// export const apiWithType = (...args: Parameters<typeof hc>): Api =>
//   hc<ApiRoutes>(...args)

export type ErrorSchema = {
  error: {
    issues: {
      code: string
      path: (string | number)[]
      message?: string | undefined
    }[]
    name: string
  }
  success: boolean
}

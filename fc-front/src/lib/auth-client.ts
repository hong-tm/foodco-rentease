import { createAuthClient } from 'better-auth/react'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import config from '@/config/config'
import { ac, admin, rental, user } from '@server/lib/permissions'

export const authClient = createAuthClient({
  baseURL: config.apiUrl,
  plugins: [
    adminClient({
      ac,
      roles: {
        admin,
        user,
        rental,
      },
    }),
    inferAdditionalFields({
      user: {
        phone: {
          type: 'string',
          required: false,
        },
      },
    }),
  ],
})

export const { signIn, signOut, signUp, useSession, getSession } = authClient

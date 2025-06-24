import { ac, admin, rental, user } from '@server/lib/permissions'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import config from '@/config/config'

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

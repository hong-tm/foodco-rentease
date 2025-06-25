import { ac, admin, rental, user } from '@server/lib/permissions'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import config from '@/config/config'
import type { auth } from '@server/lib/auth'

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
    inferAdditionalFields<typeof auth>(),
  ],
})

export const { signIn, signOut, signUp, useSession, getSession } = authClient

import { ac, admin, rental, user } from '@server/lib/permissions'
import { adminClient, inferAdditionalFields } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

import type { auth } from '@server/lib/auth'

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  // baseURL: import.meta.env.VITE_APP_SERVER_HOST as string,,
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient({
      ac,
      roles: {
        admin,
        user,
        rental,
      },
    }),
  ],
})

export const { signIn, signOut, signUp, useSession, getSession } = authClient

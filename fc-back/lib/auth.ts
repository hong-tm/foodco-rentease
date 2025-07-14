import type { BetterAuthOptions } from 'better-auth'
import { betterAuth } from 'better-auth'
import {
  admin as adminPlugin,
  captcha,
  oneTap,
  openAPI,
} from 'better-auth/plugins'
import { Pool } from 'pg'

import { sendEmail } from '../action/email/email.js'
import env from '../env.js'
import { ac, admin, rental, user } from './permissions.js'

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  // database: new Database("./database.sqlite"),
  database: new Pool({
    database: env.PG_DATABASE,
    host: 'localhost',
    user: env.PG_USER,
    password: env.PG_PASSWORD,
    port: env.PG_PORT,
    max: 10,
  }),
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        defaultValue: 'null',
      },
    },
  },

  plugins: [
    openAPI(),
    oneTap(),
    adminPlugin({
      defaultRole: 'user',
      adminRoles: 'admin',
      ac,
      roles: { admin, user, rental },
      // adminUserIds: env.ADMIN_USER_IDS?.split(",") || [],
    }),
    captcha({
      provider: 'cloudflare-turnstile',
      secretKey: env.TURNSTILE_SECRET_KEY,
    }),
  ],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Please reset your password by clicking on this link: ${url}`,
      })
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    // autoSignInAfterVerification: true,
    expiresIn: 3600, // 1 hour
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: 'Verify your email',
        text: `Please verify your email by clicking on this link: ${url}`,
      })
    },
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.given_name,
          lastName: profile.family_name,
        }
      },
    },
    github: {
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      mapProfileToUser: (profile) => {
        return {
          firstName: profile.name?.split(' ')[0],
          lastName: profile.name?.split(' ')[1],
        }
      },
    },
  },
  trustedOrigins: env.ALLOWED_ORIGINS?.split(',') || [],
  session: {
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 12, // 1 days (every 1 days the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 3 * 60, // 3 minutes
    },
  },
  rateLimit: {
    enabled: true,
    window: 60, // time window in seconds
    max: 100, // max requests in the window
    customRules: {
      '/sign-in/email': {
        window: 10,
        max: 5,
      },
    },
  },
} satisfies BetterAuthOptions)

export type AuthType = {
  Variables: {
    user: typeof auth.$Infer.Session.user | null
    session: typeof auth.$Infer.Session.session | null
  }
}

export type Session = typeof auth.$Infer.Session

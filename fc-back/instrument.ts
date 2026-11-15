import * as Sentry from '@sentry/node'

import env from './env.js'

export const initSentry = () => {
  if (!env.SENTRY_DSN) return
  Sentry.init({
    dsn: env.SENTRY_DSN,
    sendDefaultPii: true,
    release: process.env.SENTRY_RELEASE || undefined,
    environment: process.env.NODE_ENV || 'production',
  })
}

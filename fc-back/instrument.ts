import * as Sentry from '@sentry/node'

import env from './env.js'

export const initSentry = () => {
  if (!env.SENTRY_DSN) return
  Sentry.init({
    dsn: env.SENTRY_DSN,
    sendDefaultPii: true,
  })
}

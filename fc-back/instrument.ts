import * as Sentry from '@sentry/node'

import env from './env.js'

export const initSentry = () =>
  Sentry.init({
    dsn: env.SENTRY_DNS,
    sendDefaultPii: true,
  })

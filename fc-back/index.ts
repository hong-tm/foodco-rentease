import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { prettyJSON } from 'hono/pretty-json'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import type { TurnstileServerValidationResponse } from '@marsidev/react-turnstile'
import Sequelize from '@sequelize/core'
import { PostgresDialect } from '@sequelize/postgres'
import { pinoLogger } from 'hono-pino'
import { rateLimiter } from 'hono-rate-limiter'
import { pino } from 'pino'
import pretty from 'pino-pretty'

import {
  Feedback,
  Notification,
  Payment,
  Stall,
  StallTier,
  Utilities,
  account,
  session,
  user,
  verification,
} from './db/userModel.js'
import { pgConfig } from './db/pgConfig.js'
import env, { allowedOrigins } from './env.js'
import { initSentry } from './instrument.js'
import { auth, type AuthType } from './lib/auth.js'
import { feedbacksRoute } from './routes/feedbacksRoute.js'
import { notificationsRoutes } from './routes/notificationsRoutes.js'
import { paymentRoutes } from './routes/paymentRoutes.js'
import { stallsRoute } from './routes/stallsRoute.js'
import { usersRoute } from './routes/usersRoute.js'

const app = new Hono<AuthType>()

if (env.NODE_ENV === 'production') {
  initSentry()
}

app.use('*', async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })

  if (!session) {
    c.set('user', null)
    c.set('session', null)
    return next()
  }

  c.set('user', session.user)
  c.set('session', session.session)
  return next()
})

// Add CORS middleware for all routes
app.use(
  '*',
  cors({
    origin: (origin) => {
      if (allowedOrigins.includes(origin)) {
        return origin
      }
      return allowedOrigins[0] // Default to first allowed origin
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
)

app.use('*', prettyJSON())

app.get('/api', (c) => {
  return c.text('API is running!')
})

app.get('/session', async (c) => {
  const session = c.get('session')
  const user = c.get('user')

  if (!user) return c.body(null, 401)

  return c.json({
    session,
    user,
  })
})

app.post('/api/auth/verify', async (c) => {
  try {
    // Parse the request body (as JSON)
    const { token } = await c.req.json()

    if (!token) {
      return c.json({ success: false, error: 'Token is required' }, 400)
    }

    // Perform the Turnstile validation
    const response = await fetch(env.TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body: `secret=${encodeURIComponent(env.TURNSTILE_SECRET_KEY)}&response=${encodeURIComponent(
        token,
      )}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })

    const data = (await response.json()) as TurnstileServerValidationResponse

    // Check if the validation was successful
    if (!data.success) {
      const errorResponse = {
        success: false,
        message: 'Verification failed.',
      }
      return c.json(errorResponse, 400)
    }

    // Return the successful validation response
    const successResponse = {
      success: true,
      message: 'Verification successful!',
      data,
    }
    return c.json(successResponse, 200)
  } catch (error) {
    console.error('Verification error:', error)
    return c.json({ success: false, error: 'Internal server error' }, 500)
  }
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.use(
  pinoLogger({
    pino: pino(
      {
        level: env.LOG_LEVEL,
      },
      env.NODE_ENV === 'production'
        ? undefined
        : pretty({ translateTime: 'SYS:dd-mm-yyyy HH:MM:ss' }),
    ),
    http: {
      reqId: () => crypto.randomUUID(),
    },
  }),
)

app.use(
  '/api/*',
  rateLimiter<AuthType>({
    windowMs: 3 * 60 * 1000, // 3 minutes
    limit: 300,
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    message: { message: 'Too many requests, please try again later.' },
    keyGenerator: (c) => {
      const user = c.get('user')

      if (!user)
        throw new HTTPException(401, { message: 'User Not Authorize!' })

      return user?.id
    }, // Method to generate custom identifiers for clients.
    // store: ... , // Redis, MemoryStore, etc. See below.
  }),
)

export const apiRoutes = app
  .basePath('/api')
  .route('/feedbacks', feedbacksRoute)
  .route('/users', usersRoute)
  .route('/stalls', stallsRoute)
  .route('/notifications', notificationsRoutes)
  .route('/payments', paymentRoutes)

// Server static files
app.use('*', serveStatic({ root: './webpage' }))

app.use('*', serveStatic({ path: './webpage/index.html' }))

//sequalize
const sequelize = new Sequelize({
  dialect: PostgresDialect,
  ...pgConfig,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  clientMinMessages: 'notice',
  logging: false,
  models: [
    user,
    account,
    session,
    verification,
    Stall,
    Feedback,
    Payment,
    Utilities,
    Notification,
    StallTier,
  ],
})

try {
  await sequelize.authenticate()
  console.log('Connection has been established successfully.')
} catch (error) {
  console.error('Unable to connect to the database:', error)
  process.exit(1)
}

serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

export type ApiRoutes = typeof apiRoutes

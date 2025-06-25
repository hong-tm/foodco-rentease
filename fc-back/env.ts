import fs from 'fs'
import path from 'path'
import * as dotenv from 'dotenv'
import { z } from 'zod/v4'

dotenv.config()

const EnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_URL: z.string().default('http://localhost:3000'),
  ALLOWED_ORIGINS: z
    .string()
    .default('http://localhost:3000,http://localhost:5173'),

  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),

  EMAIL_VERIFICATION_CALLBACK_URL: z.string(),
  RESEND_API: z.string(),
  TURNSTILE_SECRET_KEY: z.string(),
  TURNSTILE_VERIFY_URL: z
    .url({ error: 'This is not a valid url' })
    .default('https://challenges.cloudflare.com/turnstile/v0/siteverify'),

  DB_FILE_NAME: z.string().default('file:database.sqlite'),

  PG_PASSWORD: z.string(),
  PG_USER: z.string().default('postgres'),
  PG_DATABASE: z.string(),
  PG_PORT: z.coerce.number().default(5432),

  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().min(1),

  STRIPE_SECRET_KEY: z.string(),
  STRIPE_DOMAIN: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  STRIPE_WEBHOOK_ENDPOINT_SECRET: z.string(),
})

export type env = z.infer<typeof EnvSchema>

// validate
const envPath = path.resolve(process.cwd(), '.env')
let envFileKeys: string[] = []

try {
  if (fs.existsSync(envPath)) {
    const envFileLines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
    envFileKeys = envFileLines
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => line.split('=')[0].trim())
      .filter((key) => key.length > 0) // <-- add this filter!
  }
} catch (error) {
  console.error('❌ Error reading .env file:', error)
  process.exit(1)
}

const schemaKeys = Object.keys(EnvSchema.shape)
const extraKeys = envFileKeys.filter((key) => !schemaKeys.includes(key))

const red = (str: string) => `\x1b[31m${str}\x1b[0m`

if (extraKeys.length > 0) {
  console.warn(
    `⚠️ The following variables are present in .env but NOT in your schema: ${extraKeys
      .map(red)
      .join(', ')}`,
  )
}

// Parse
const { data: env, error } = EnvSchema.safeParse(process.env)

if (error) {
  console.error('🔴 Invalid environment variables:')
  const prettyError = z.prettifyError(error)
  console.error(prettyError)
  process.exit(1)
} else {
  console.log('🟢 Environment variables loaded successfully!')
}

export default env!

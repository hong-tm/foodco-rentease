// Create the schema from the app's own Sequelize models (fc-back/dist) and insert seed data.
// Bare imports resolve from fc-back, so launch.sh feeds this file to `node --input-type=module` with cwd fc-back.
import { randomUUID } from 'node:crypto'
import Sequelize from '@sequelize/core'
import { PostgresDialect } from '@sequelize/postgres'
import { hashPassword } from 'better-auth/crypto'

import { pgConfig } from './dist/db/pgConfig.js'
import * as m from './dist/db/userModel.js'

const PASSWORD = 'Verify-pass-123'
const USERS = {
  admin: { email: 'admin@verify.test', name: 'Verify Admin', role: 'admin' },
  rental: { email: 'rental@verify.test', name: 'Verify Rental', role: 'rental' },
  user: { email: 'user@verify.test', name: 'Verify User', role: 'user' },
}

const sequelize = new Sequelize({
  dialect: PostgresDialect,
  ...pgConfig,
  logging: false,
  models: [m.user, m.account, m.session, m.verification, m.Stall, m.Feedback,
    m.Payment, m.Utilities, m.Notification, m.StallTier],
})
await sequelize.sync()

const hash = await hashPassword(PASSWORD)
const now = new Date()
const ids = {}
for (const [key, u] of Object.entries(USERS)) {
  const id = randomUUID()
  ids[key] = id
  await m.user.create({ id, ...u, emailVerified: true, banned: false, phone: '0123456789', createdAt: now, updatedAt: now })
  await m.account.create({ id: randomUUID(), accountId: id, userId: id, providerId: 'credential', password: hash, createdAt: now, updatedAt: now })
}

await m.StallTier.bulkCreate([
  { tierId: 1, tierName: 'Standard', tierPrice: 300 },
  { tierId: 2, tierName: 'Premium', tierPrice: 500 },
  { tierId: 3, tierName: 'Corner', tierPrice: 700 },
])
const stalls = Array.from({ length: 8 }, (_, i) => ({
  stallNumber: i + 1,
  stallName: i === 0 ? 'Verify Noodle House' : 'Still Empty...',
  description: i === 0 ? 'Seeded rented stall' : 'Seeded vacant stall',
  stallImage: '',
  stallSize: 10 + i,
  stallTierNo: (i % 3) + 1,
  stallOwner: i === 0 ? ids.rental : ids.admin,
  rentStatus: i === 0,
  startAt: i === 0 ? now : null,
}))
await m.Stall.bulkCreate(stalls)
await m.Feedback.create({ feedbackContent: 'Seeded feedback: clean tables', happiness: 4, stall: 1 })

await sequelize.close()
console.log(`seed: ${Object.keys(USERS).length} users (password ${PASSWORD}), 3 tiers, ${stalls.length} stalls, 1 feedback`)

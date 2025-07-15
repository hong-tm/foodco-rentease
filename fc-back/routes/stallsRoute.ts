import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod/v4'

import {
  Stall as StallTable,
  StallTier as StallTierTable,
  user as UserTable,
} from '../db/userModel.js'
import type { AuthType } from '../lib/auth.js'
import { updateStallSchema } from '../lib/sharedType.js'
import { tryCatch } from '../lib/try-catch.js'
import { adminVerify } from '../lib/verifyuser.js'

export const stallsRoute = new Hono<AuthType>()
  .get('/', async (c) => {
    const stalls = await StallTable.findAll({
      order: ['stallNumber'],
      include: [
        {
          association: 'stallTierNumber',
        },
        {
          association: 'stallOwnerId',
        },
      ],
    })

    if (!stalls) {
      return c.json({ message: 'Stalls not found!' }, 404)
    }

    return c.json({ stall: stalls }, 200)
  })
  .get('/tierPrices', async (c) => {
    const tierPrice = await StallTierTable.findAll()

    if (!tierPrice) {
      return c.json({ message: 'Tier prices not found!' }, 404)
    }

    const validatedTierPrice = tierPrice.map((row) => row.get({ plain: true }))

    return c.json({ tierPrice: validatedTierPrice }, 200)
  })
  .get('/:stallOwner', async (c) => {
    const stallOwner = c.req.param('stallOwner')

    // Find user by ID first
    const user = await UserTable.findByPk(stallOwner)
    if (!user) {
      return c.json({ message: 'User not found' }, 404)
    }

    // Get all stalls owned by this user
    const stalls = await StallTable.findAll({
      where: {
        stallOwner: stallOwner,
      },
      include: [
        {
          association: 'stallTierNumber',
        },
        {
          association: 'user',
        },
      ],
      order: [['stallNumber', 'ASC']],
    })

    if (!stalls) {
      return c.json({ message: 'Stalls not found!' }, 404)
    }

    return c.json({ stalls, user }, 200)
  })
  .get('/current-vacancy', async (c) => {
    const allStalls = await StallTable.findAll({
      order: ['stallNumber'],
      include: [
        {
          association: 'stallTierNumber',
        },
        {
          association: 'stallOwnerId',
        },
      ],
    })

    const rentedStalls = allStalls.filter((stall) => stall.rentStatus)

    if (!rentedStalls) {
      return c.json({ message: 'Rented stalls not found!' }, 404)
    }

    return c.json(
      {
        totalStalls: allStalls.length,
        stalls: rentedStalls,
      },
      200,
    )
  })
  .post(
    '/:stallId',
    adminVerify(),
    zValidator('json', updateStallSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: `Invalid stall data! ${result.error}` }, 400)
      }
    }),
    zValidator('param', z.object({ stallId: z.string() }), (result, c) => {
      if (!result.success) {
        return c.json({ message: 'Invalid stall ID!' }, 400)
      }
    }),
    async (c) => {
      const { stallId } = c.req.valid('param')
      const body = c.req.valid('json')

      // Get user id from email
      const user = await UserTable.findOne({
        where: {
          email: body.stallOwner,
        },
      })

      if (!user) {
        return c.json({ message: 'User not found' }, 404)
      }

      // Find the stall first
      const stall = await StallTable.findByPk(stallId)

      if (!stall) {
        return c.json({ message: 'Stall not found' }, 404)
      }

      // Update stall data
      await stall.update({
        stallNumber: body.stallNumber,
        stallName: body.stallName,
        description: body.description,
        stallImage: body.stallImage,
        stallSize: body.stallSize,
        stallOwner: user?.id || undefined,
        rentStatus: body.rentStatus,
        startAt: body.startAt,
        endAt: body.endAt,
        stallTierNo: body.stallTierNumber.tierId,
      })

      // Save the changes
      const { data: savedStall, error } = await tryCatch(stall.save())

      if (error) {
        c.var.logger.error(
          { cause: error.cause, message: error.message },
          'Update Stall Error',
        )
        return c.json({ message: 'Internal Server Error' }, 500)
      }

      return c.json({ stall: savedStall }, 200)
    },
  )

import { Hono } from 'hono'
import {
  Stall as StallTable,
  user as UserTable,
  StallTier as StallTierTable,
} from '../db/userModel.js'
import { zValidator } from '@hono/zod-validator'
import { updateStallSchema } from '../lib/sharedType.js'
import { adminVerify } from '../lib/verifyuser.js'

export const stallsRoute = new Hono()

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
      return c.json({ error: 'Stalls not found!' }, 404)
    }

    return c.json({ stall: stalls }, 200)
  })

  .get('/tierPrices', async (c) => {
    const tierPrice = await StallTierTable.findAll()

    if (!tierPrice) {
      return c.json({ error: 'Tier prices not found!' }, 404)
    }

    return c.json({ tierPrice: tierPrice }, 200)
  })

  .get('/:stallOwner', async (c) => {
    const stallOwner = c.req.param('stallOwner')

    // Find user by ID first
    const user = await UserTable.findByPk(stallOwner)
    if (!user) {
      return c.json({ error: 'User not found' }, 404)
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
      return c.json({ error: 'Stalls not found!' }, 404)
    }

    return c.json({ stalls, user }, 200)
  })

  .post(
    '/:stallId',
    adminVerify(),
    zValidator('json', updateStallSchema),
    async (c) => {
      const stallId = c.req.param('stallId')
      const body = c.req.valid('json')

      // console.log("Received Stall ID:", stallId);
      // console.log("Validated Body:", body);

      // Get user id from email
      const user = await UserTable.findOne({
        where: {
          email: body.stallOwner,
        },
      })

      if (!user) {
        return c.json({ error: 'User not found' }, 404)
      }

      // Find the stall first
      const stall = await StallTable.findByPk(stallId)

      if (!stall) {
        return c.json({ error: 'Stall not found' }, 404)
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
      await stall.save()

      return c.json(
        {
          message: 'Stall updated successfully',
          stall,
        },
        200,
      )
    },
  )

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
      return c.json({ error: 'Rented stalls not found!' }, 404)
    }

    return c.json(
      {
        totalStalls: allStalls.length,
        stalls: rentedStalls,
      },
      200,
    )
  })

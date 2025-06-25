import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { literal } from '@sequelize/core'

import { Notification as NotificationTable } from '../db/userModel.js'
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from '../lib/sharedType.js'
import type { AuthType } from '../lib/auth.js'

export const notificationsRoutes = new Hono<AuthType>()

  .get('/', async (c) => {
    const notifications = await NotificationTable.findAll({
      order: [
        [
          // Custom order: null -> true -> false
          literal(`
						CASE 
							WHEN "notificationRead" IS NULL THEN 1
							WHEN "notificationRead" = true THEN 2
							ELSE 3
						END
					`),
          'ASC',
        ],
        ['appointmentDate', 'ASC'],
      ],
    })

    if (!notifications) {
      return c.json({ error: 'Notifications not found!' }, 404)
    }

    return c.json({ notification: notifications }, 200)
  })

  .get('/:userId', async (c) => {
    const userId = c.req.param('userId')
    const notifications = await NotificationTable.findAll({
      where: { userId },
      order: [
        [
          // Custom order: true -> null -> false
          literal(`
						CASE 
							WHEN "notificationRead" = true THEN 1
							WHEN "notificationRead" IS NULL THEN 2
							ELSE 3
						END
					`),
          'ASC',
        ],
        ['appointmentDate', 'ASC'],
      ],
    })

    if (!notifications) {
      return c.json({ error: 'Notifications not found!' }, 404)
    }

    return c.json({ notification: notifications }, 200)
  })

  .post('/', zValidator('json', createAppointmentSchema), async (c) => {
    const data = c.req.valid('json')

    // Check if notification with same message and userId already exists
    const existingNotification = await NotificationTable.findOne({
      where: {
        userId: data.userId,
        notificationMessage: data.notificationMessage,
      },
    })

    if (existingNotification) {
      return c.json(
        { error: 'You have already made this appointment request' },
        400,
      )
    }

    const notification = await NotificationTable.create(data)

    if (!notification) {
      return c.json({ error: 'Notification not found!' }, 404)
    }

    return c.json({ notification: notification }, 201)
  })

  .post(
    '/update-appoitmentStatus',
    zValidator('json', updateAppointmentStatusSchema),
    async (c) => {
      const data = c.req.valid('json')

      const notification = await NotificationTable.update(
        {
          notificationRead: data.notificationRead,
          stallNumber: data.stallNumber,
        },
        { where: { notificationId: data.notificationId } },
      )

      if (!notification) {
        return c.json({ error: 'Notification not found!' }, 404)
      }

      return c.json({ notification: notification }, 201)
    },
  )

import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { literal, type Order } from '@sequelize/core'

import { Notification as NotificationTable } from '../db/userModel.js'
import type { AuthType } from '../lib/auth.js'
import {
  createAppointmentSchema,
  updateAppointmentStatusSchema,
} from '../lib/sharedType.js'
import { tryCatch } from '../lib/try-catch.js'

type ReadRank = { unread: number; read: number; rejected: number }

// notificationRead: null = unread, true = read, false = rejected
const orderByRead = (rank: ReadRank): Order => [
  [
    literal(`
      CASE
        WHEN "notificationRead" IS NULL THEN ${rank.unread}
        WHEN "notificationRead" = true THEN ${rank.read}
        ELSE ${rank.rejected}
      END
    `),
    'ASC',
  ],
  ['appointmentDate', 'ASC'],
]

export const notificationsRoutes = new Hono<AuthType>()
  .get('/', async (c) => {
    const notifications = await NotificationTable.findAll({
      order: orderByRead({ unread: 1, read: 2, rejected: 3 }),
    })

    if (!notifications) {
      return c.json({ message: 'Notifications not found!' }, 404)
    }

    return c.json({ notification: notifications }, 200)
  })
  .get('/:userId', async (c) => {
    const userId = c.req.param('userId')
    const user = c.get('user')

    if (!user) {
      return c.json({ message: 'User not authenticated!' }, 401)
    }

    if (user.id !== userId && user.role !== 'admin') {
      return c.json({ message: 'Forbidden' }, 403)
    }

    const notifications = await NotificationTable.findAll({
      where: { userId },
      order: orderByRead({ read: 1, unread: 2, rejected: 3 }),
    })

    if (!notifications) {
      return c.json({ message: 'Notifications not found!' }, 404)
    }

    return c.json({ notification: notifications }, 200)
  })
  .post(
    '/',
    zValidator('json', createAppointmentSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: 'Invalid appointment data!' }, 400)
      }
    }),
    async (c) => {
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
          { message: 'You have already made this appointment request' },
          400,
        )
      }

      const { data: notification, error } = await tryCatch(
        NotificationTable.create(data),
      )

      if (error) {
        c.var.logger.error(
          { cause: error.cause, message: error.message },
          'Create Notification Error',
        )
        return c.json({ message: 'Internal Server Error!' }, 500)
      }

      if (!notification) {
        return c.json({ message: 'Notification not found!' }, 404)
      }
      return c.json({ notification: notification }, 201)
    },
  )
  .post(
    '/update-appoitmentStatus',
    zValidator('json', updateAppointmentStatusSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: 'Invalid appointment data!' }, 400)
      }
    }),
    async (c) => {
      const data = c.req.valid('json')

      const { data: notification, error } = await tryCatch(
        NotificationTable.update(
          {
            notificationRead: data.notificationRead,
            stallNumber: data.stallNumber,
          },
          { where: { notificationId: data.notificationId } },
        ),
      )

      if (error) {
        c.var.logger.error(
          { cause: error.cause, message: error.message },
          'Update Appointment Status Error',
        )
        return c.json({ message: 'Internal Server Error!' }, 500)
      }

      if (!notification) {
        return c.json({ message: 'Notification not found!' }, 404)
      }

      return c.json({ notification: notification }, 201)
    },
  )

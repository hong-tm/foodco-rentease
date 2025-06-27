import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { Op } from '@sequelize/core'
import { tryCatch } from 'lib/try-catch.js'

import { sendEmail } from '../action/email/email.js'
import { user as UserTable } from '../db/userModel.js'
import type { AuthType } from '../lib/auth.js'
import { emailSchema } from '../lib/sharedType.js'
import { adminVerify } from '../lib/verifyuser.js'

export const usersRoute = new Hono<AuthType>()
  .get('/', adminVerify(), async (c) => {
    const users = await UserTable.findAll({
      order: ['name'],
    })

    if (!users) {
      return c.json({ error: 'Users not found!' }, 404)
    }

    return c.json({ user: users }, 200)
  })
  .get('/rentals', adminVerify(), async (c) => {
    const users = await UserTable.findAll({
      where: {
        role: {
          [Op.ne]: 'user',
        },
      },
      include: [
        {
          association: 'stalls',
          // where: {
          // 	rentStatus: true,
          // },
        },
      ],
      order: [
        [
          { model: UserTable.associations.stalls.target, as: 'stalls' },
          'endAt',
          'ASC',
        ],
      ],
    })

    if (!users) {
      return c.json({ error: 'Users not found!' }, 404)
    }

    return c.json({ user: users }, 200)
  })
  .post(
    '/send-reminder-email',
    adminVerify(),
    zValidator('json', emailSchema, (result, c) => {
      if (!result.success)
        return c.json({ message: 'Invalid email data!' }, 400)
    }),
    async (c) => {
      const { to, subject, text } = c.req.valid('json')

      if (!to || !subject || !text) {
        return c.json(
          { message: 'Missing required fields for the email!' },
          400,
        )
      }

      const { data: emailResponse, error } = await tryCatch(
        sendEmail({ to, subject, text }),
      )

      if (error) {
        console.error('Error in /send-reminder-email:', error.message || error)
        return c.json({ message: 'Send reminder email failed!' }, 500)
      }

      return c.json({ emailResponse: emailResponse }, 201)
    },
  )

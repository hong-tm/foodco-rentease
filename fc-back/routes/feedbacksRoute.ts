import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod/v4'

import { Feedback as FeedbackTable } from '../db/userModel.js'
import type { AuthType } from '../lib/auth.js'
import { createFeedbackSchema } from '../lib/sharedType.js'
import { tryCatch } from '../lib/try-catch.js'
import { adminVerify } from '../lib/verifyuser.js'

export const feedbacksRoute = new Hono<AuthType>()
  .get('/', adminVerify(), async (c) => {
    const feedbacks = await FeedbackTable.findAll({
      order: [['createdAt', 'DESC']],
    })

    if (!feedbacks) {
      return c.json({ message: 'Feedbacks not found!' }, 404)
    }

    return c.json({ feedback: feedbacks }, 200)
  })
  .post(
    '/',
    zValidator('json', createFeedbackSchema, (result, c) => {
      if (!result.success) {
        return c.json({ message: 'Invalid feedback data!' }, 400)
      }
    }),
    async (c) => {
      const { data: feedback, error } = await tryCatch(
        FeedbackTable.create(c.req.valid('json')),
      )

      if (!feedback) {
        return c.json({ message: 'Feedback not found!' }, 404)
      }

      if (error) {
        return c.json({ message: 'Internal Server Error!' }, 500)
      }

      return c.json({ feedback: feedback }, 201)
    },
  )
  .delete(
    '/:id',
    zValidator('param', z.object({ id: z.number() }), (result, c) => {
      if (!result.success) {
        return c.json({ message: 'Invalid feedback id!' }, 400)
      }
    }),
    adminVerify(),
    async (c) => {
      const id = c.req.valid('param').id

      const { data: feedback, error } = await tryCatch(
        FeedbackTable.destroy({
          where: {
            id: id,
          },
        }),
      )

      if (!feedback) {
        return c.json({ message: 'Feedback not found!' }, 404)
      }

      if (error) {
        return c.json({ message: 'Internal Server Error!' }, 500)
      }

      return c.json({ feedback: feedback }, 200)
    },
  )
  .get('/get-feedbackHappiness', adminVerify(), async (c) => {
    const { data: feedbacks, error } = await tryCatch(
      FeedbackTable.findAll({
        attributes: [
          'stall',
          [
            FeedbackTable.sequelize!.fn(
              'SUM',
              FeedbackTable.sequelize!.col('happiness'),
            ),
            'totalHappiness',
          ],
          [
            FeedbackTable.sequelize!.fn(
              'COUNT',
              FeedbackTable.sequelize!.col('id'),
            ),
            'totalFeedbacks',
          ],
        ],
        group: ['stall'],
        raw: true,
        order: [['stall', 'ASC']],
      }),
    )

    if (!feedbacks) {
      return c.json({ message: 'No feedbacks found!' }, 404)
    }

    if (error) {
      return c.json({ message: 'Internal Server Error!' }, 500)
    }

    return c.json(
      {
        stallHappiness: feedbacks.map((feedback: any) => ({
          stallId: feedback.stall,
          totalHappiness: Number(feedback.totalHappiness),
          totalFeedbacks: feedback.totalFeedbacks,
        })),
      },
      200,
    )
  })

// .get("/:id", (c) =>
// {
// 	const id = Number.parseInt(c.req.param("id"));
// 	const feedback = fakeFeedback.find((feedback) => feedback.id === id);

// 	if (!feedback)
// 	{
// 		return c.notFound();
// 	}
// 	return c.json({ feedback });
// })

// .put("/:id", zValidator("json", createFeedbackSchema), async (c) => {
// 	const id = Number.parseInt(c.req.param("id"));
// 	const index = fakeFeedback.findIndex((feedback) => feedback.id === id);

// 	if (index === -1) {
// 		return c.notFound();
// 	}

// 	const feedback = await c.req.valid("json");
// 	fakeFeedback[index] = { ...feedback, id };

// 	return c.json({ feedback: fakeFeedback[index] });
// });

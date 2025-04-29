import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { Feedback as FeedbackTable } from '../db/userModel.js'
import { createFeedbackSchema } from '../lib/sharedType.js'
import { adminVerify } from '../lib/verifyuser.js'

export const feedbacksRoute = new Hono()
  .get('/', adminVerify(), async (c) => {
    const feedbacks = await FeedbackTable.findAll({
      order: [['createdAt', 'DESC']],
    })

    if (!feedbacks) {
      return c.notFound()
    }

    return c.json({ feedback: feedbacks })
  })

  .post('/', zValidator('json', createFeedbackSchema), async (c) => {
    try {
      // console.log(c.req.valid("json"));
      const feedback = await FeedbackTable.create(c.req.valid('json'))

      if (!feedback) {
        return c.notFound()
      }

      c.status(201)
      return c.json({ feedback: feedback })
    } catch (error: any) {
      return c.json({ error: error.message })
    }
  })

  .delete('/:id', adminVerify(), async (c) => {
    const id = Number.parseInt(c.req.param('id'))

    const feedback = await FeedbackTable.destroy({
      where: {
        id: id,
      },
    })

    if (!feedback) {
      return c.notFound()
    }
    return c.json({ feedback: feedback })
  })

  .get('/get-feedbackHappiness', adminVerify(), async (c) => {
    const feedbacks = await FeedbackTable.findAll({
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
    })

    if (!feedbacks.length) {
      return c.json({ stallHappiness: [] })
    }

    return c.json({
      stallHappiness: feedbacks.map((feedback: any) => ({
        stallId: feedback.stall,
        totalHappiness: Number(feedback.totalHappiness),
        totalFeedbacks: feedback.totalFeedbacks,
      })),
    })
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

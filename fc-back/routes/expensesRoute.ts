import { Hono } from 'hono'
import { z } from 'zod'
import { zValidator } from '@hono/zod-validator'

const expensesSchema = z.object({
  id: z.number().int().positive().min(1),
  title: z.string().min(3).max(255),
  amount: z.number().int().positive(),
})

type Expense = z.infer<typeof expensesSchema>

const createPostSchema = expensesSchema.omit({ id: true })

const fakeExpenses: Expense[] = [
  {
    id: 1,
    title: 'Car Insurance',
    amount: 294.67,
  },
  {
    id: 2,
    title: 'Rent',
    amount: 1000,
  },
  {
    id: 3,
    title: 'Groceries',
    amount: 94.12,
  },
]

export const expensesRoute = new Hono()

  .get('/', (c) => {
    return c.json({ expenses: fakeExpenses })
  })

  .post('/', zValidator('json', createPostSchema), async (c) => {
    const expense = c.req.valid('json')
    fakeExpenses.push({ ...expense, id: fakeExpenses.length + 1 })

    c.status(201)
    return c.json({ expense })
  })

  .get('/total-spent', async (c) => {
    const total = fakeExpenses.reduce((acc, expense) => acc + expense.amount, 0)
    return c.json({ total })
  })

  .get('/:id', (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const expense = fakeExpenses.find((expense) => expense.id === id)

    if (!expense) {
      return c.notFound()
    }
    return c.json({ expense })
  })

  .delete('/:id', (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const index = fakeExpenses.findIndex((expense) => expense.id === id)

    if (index === -1) {
      return c.notFound()
    }
    fakeExpenses.splice(index, 1)
    return c.json({ message: 'Expense deleted' })
  })

  .put('/:id', zValidator('json', createPostSchema), async (c) => {
    const id = Number.parseInt(c.req.param('id'))
    const index = fakeExpenses.findIndex((expense) => expense.id === id)

    if (index === -1) {
      return c.notFound()
    }
    const expense = await c.req.valid('json')
    fakeExpenses[index] = { ...expense, id }
    return c.json({ expense: fakeExpenses[index] })
  })

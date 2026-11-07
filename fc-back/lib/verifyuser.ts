import { createMiddleware } from 'hono/factory'

export function adminVerify() {
  return createMiddleware(async (c, next) => {
    const user = c.get('user')

    if (!user) {
      console.error('AdminVerify - No user found in context.')
      return c.json({ error: 'User not authenticated!' }, 401)
    }

    if (user.role !== 'admin') {
      console.error(
        `AdminVerify - User ${user.id} is not an admin (role: ${user.role})`,
      )
      return c.json({ error: 'You are not an Admin!' }, 403)
    }

    console.log(
      'AdminVerify - Admin verification successful for user:',
      user.id,
    )
    await next()
  })
}

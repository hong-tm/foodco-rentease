import { Resend } from 'resend'

import env from '../../env.js'

const resend = new Resend(env.RESEND_API)

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string
  subject: string
  text: string
}) {
  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to,
    subject,
    text,
  })

  if (error) {
    throw new Error(error.name)
  }

  return data
}

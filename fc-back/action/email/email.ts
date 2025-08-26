import { Resend } from 'resend'

import env from './../../env.js'

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string
  subject: string
  text: string
}) {
  const resend = new Resend(env.RESEND_API)

  if (!env.RESEND_API) {
    throw new Error('RESEND_API is not set')
  }

  const { data, error } = await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: to,
    subject: subject,
    text: text,
  })

  if (error) {
    await resend.emails.send({
      from: env.RESEND_FROM_EMAIL,
      to: env.RESEND_FROM_EMAIL,
      subject: 'Error sending email',
      html: `<p>Error sending email: ${error.message}</p>`,
    })
    throw new Error(error.name)
  }

  return data
}

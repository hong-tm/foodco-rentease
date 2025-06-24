import * as dotenv from 'dotenv'
import { Resend } from 'resend'

import env from './../../env.js'

dotenv.config()

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string
  subject: string
  text: string
}) {
  try {
    const resend: any = new Resend(env.RESEND_API)

    if (!env.RESEND_API) {
      throw new Error('RESEND_API is not set')
    }

    const { data, error } = await resend.emails.send({
      from: `tech@nullsoul.com`,
      to: to,
      subject: subject,
      text: text,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  } catch (err) {
    console.log(err)
    throw err
  }
}

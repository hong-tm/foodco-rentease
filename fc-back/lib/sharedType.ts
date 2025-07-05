import { z } from 'zod/v4'

export const signupformSchema = z
  .object({
    name: z
      .string()
      .min(2, {
        error: (iss) => {
          return `Name must have ${iss.minimum} characters or more`
        },
      })
      .max(32, {
        error: (iss) => {
          return `Name must have ${iss.maximum} characters or less`
        },
      }),
    email: z.email({ error: 'Invalid email address' }),
    password: z
      .string()
      .min(8, {
        error: (iss) => {
          return `Password must have ${iss.minimum} characters or more`
        },
      })
      .max(32, {
        error: (iss) => {
          return `Password must have ${iss.maximum} characters or less`
        },
      })
      .regex(/(?=.*[A-Z])/, {
        error: 'At least one uppercase character',
      })
      .regex(/(?=.*[a-z])/, {
        error: 'At least one lowercase character',
      })
      .regex(/(?=.*\d)/, {
        error: 'At least one digit',
      })
      .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
        error: 'At least one special character',
      }),
    confirmPassword: z.string(),
    token: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  })

export const signinFormSchema = z.object({
  email: z.string().email({ error: 'Invalid email address' }),
  password: z
    .string()
    .min(8, {
      error: (iss) => {
        return `Password must have ${iss.minimum} characters or more`
      },
    })
    .max(32, {
      error: (iss) => {
        return `Password must have ${iss.maximum} characters or less`
      },
    })
    .regex(/(?=.*[A-Z])/, {
      error: 'At least one uppercase character',
    })
    .regex(/(?=.*[a-z])/, {
      error: 'At least one lowercase character',
    })
    .regex(/(?=.*\d)/, {
      error: 'At least one digit',
    })
    .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
      error: 'At least one special character',
    }),
  rememberMe: z.boolean(),
  token: z.string(),
})

export const forgotPasswordFormSchema = z.object({
  email: z.email({ error: 'Invalid email address' }),
})

export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, {
        error: (iss) => {
          return `Password must have ${iss.minimum} characters or more`
        },
      })
      .max(32, {
        error: (iss) => {
          return `Password must have ${iss.maximum} characters or less`
        },
      })
      .regex(/(?=.*[a-z])/, {
        error: 'At least one lowercase character',
      })
      .regex(/(?=.*\d)/, {
        error: 'At least one digit',
      })
      .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
        error: 'At least one special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  })

export const changePasswordFormSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, {
        error: (iss) => {
          return `Password must have ${iss.minimum} characters or more`
        },
      })
      .regex(/[a-zA-Z0-9]/, { error: 'Password must be alphanumeric' }),
    password: z
      .string()
      .min(8, {
        error: (iss) => {
          return `Password must have ${iss.minimum} characters or more`
        },
      })
      .regex(/(?=.*[A-Z])/, {
        error: 'At least one uppercase character',
      })
      .regex(/(?=.*[a-z])/, {
        error: 'At least one lowercase character',
      })
      .regex(/(?=.*\d)/, {
        error: 'At least one digit',
      })
      .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, {
        error: 'At least one special character',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    error: 'Passwords do not match',
  })

export const updateUsernameFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      error: (iss) => {
        return `Name must have ${iss.minimum} characters or more`
      },
    })
    .max(32, {
      error: (iss) => {
        return `Name must have ${iss.maximum} characters or less`
      },
    }),
})

export const feedbackSchema = z.object({
  id: z.number().int().positive().min(1),
  happiness: z
    .number({ error: 'Must choose a happiness' })
    .int()
    .positive({ error: 'Must choose a happiness' })
    .min(1)
    .max(4, { error: 'This is not a valid happiness' }),
  stall: z
    .number()
    .int()
    .positive({ error: 'Must choose a stall number' })
    .min(1, { error: 'Must choose a stall number' })
    .max(20),
  feedbackContent: z
    .string()
    .min(3, { error: 'Must contain at least 3 character(s)' })
    .max(255),
})

export const createFeedbackSchema = feedbackSchema.omit({ id: true })

export const userSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  image: z.string().optional(),
  phone: z.string().optional(),
  banned: z.boolean().optional(),
  role: z.string().optional(),
  banReason: z.string().optional(),
  banExpires: z.date().optional(),
})

export const sessionSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  expiresAt: z.date(),
  token: z.string(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  impersonatedBy: z.string().optional(),
  user: userSchema,
})

export const rentalsSchema = z.object({})

export const updateStallSchema = z
  .object({
    stallNumber: z.number().int().positive().min(1),
    stallName: z.string().min(1, 'Stall name is required'),
    description: z.string().optional(),
    stallImage: z.url('Must be a valid URL').optional(),
    stallSize: z
      .number({ error: 'Stall size must be a number' })
      .positive({ error: 'Stall size must be positive' }),
    stallOwner: z
      .email({ error: 'This is not a valid email address' })
      .optional(),
    rentStatus: z.boolean({ error: 'Rent status is required' }),
    startAt: z.coerce.date(),
    endAt: z.coerce.date(),
    stallTierNumber: z.object({
      tierId: z.number({ error: 'Tier ID must be a number' }),
    }),
  })
  .refine((data) => data.endAt > data.startAt, {
    error: 'End date must be after start date',
    path: ['endAt'],
  })

export const emailSchema = z.object({
  to: z.email(),
  subject: z.string(),
  text: z.string(),
})

export const appointmentSchema = z.object({
  notificationId: z.number().int().positive().min(1),
  userId: z.string(),
  notificationMessage: z.string(),
  notificationRead: z.boolean(),
  appointmentDate: z.coerce.date(),
  stallNumber: z.number().int().positive().min(1),
})

export const createAppointmentSchema = appointmentSchema.omit({
  notificationId: true,
  notificationRead: true,
})

export const updateAppointmentStatusSchema = z.object({
  notificationId: z.number().int().positive().min(1),
  notificationRead: z.boolean(),
  stallNumber: z.number().int().positive().min(1),
})

export const paymentSchema = z.object({
  paymentId: z.string(),
  stallId: z.number().int().positive(),
  userId: z.string(),
  paymentType: z.string(),
  paymentAmount: z.string(),
  paymentStatus: z.boolean(),
  paymentDate: z.date(),
  paymentUser: z
    .object({
      id: z.string(),
      name: z.string().nullable(),
      image: z.string().nullable(),
    })
    .nullable()
    .optional(),
})

export type PaymentRecord = z.infer<typeof paymentSchema>

export type CreatePaymentUtilityRequest = z.infer<
  typeof createPaymentUtilitySchema
>

export type RawPaymentRecord = {
  paymentId: string
  stallId: number
  userId: string
  paymentType: string
  paymentAmount: string
  paymentStatus: boolean
  paymentDate: Date
  paymentUser?: {
    id: string
    name: string | null
    image: string | null
  } | null
}

export const createPaymentIntentSchema = z.object({
  amount: z.number().positive(),
  stallId: z.number(),
  userId: z.string(),
})

export type CreatePaymentIntentRequest = z.infer<
  typeof createPaymentIntentSchema
>

export const paymentIntentSchema = z.object({
  amount: z.number(),
  stallId: z.number(),
  userId: z.string(),
})

export type PaymentIntentRequest = z.infer<typeof paymentIntentSchema>

export type PaymentIntentResponse = {
  clientSecret: string
}

export type PaymentNotification = {
  notificationId: number
  notificationerror: string
  notificationRead: boolean | null
  appointmentDate: Date
  stallNumber?: number
  userId?: string | number
}

export type PaymentIntentParams = {
  amount: number
  stallId: number
  userId: string
}

export const createPaymentRecordSchema = z.object({
  paymentId: z.string(),
  stallId: z.number(),
  userId: z.string(),
  paymentAmount: z.string(),
  paymentType: z.string(),
  paymentStatus: z.boolean(),
  paymentDate: z.string(),
})

export const updatePaymentStatusSchema = z.object({
  paymentId: z.string(),
  newPaymentId: z.string(),
  paymentStatus: z.boolean(),
})

export type UpdatePaymentStatusRequest = z.infer<
  typeof updatePaymentStatusSchema
>

export type CreatePaymentRecordRequest = z.infer<
  typeof createPaymentRecordSchema
>

export const createPaymentUtilitySchema = z.object({
  paymentId: z.string(),
  stallId: z.number(),
  userId: z.string(),
  paymentAmount: z.string(),
  paymentType: z.string(),
  paymentStatus: z.boolean(),
  paymentDate: z.string(),
})

const utilitiesType = ['water', 'electric', 'rental'] as const

export const stallUtilitiesFormSchema = z.object({
  stallId: z
    .number({ error: 'Please select a stall' })
    .int()
    .positive({ error: 'Please select a stall' }),
  paymentType: z.enum(utilitiesType, {
    error: 'Please select a utility type',
  }),
  paymentAmount: z
    .number({ error: 'Amount must be at least RM 0.01' })
    .positive({ error: 'Amount must be positive' })
    .min(0.01, { error: 'Amount must be at least RM 0.01' }),
  paymentDate: z.date({ error: 'Please select a date' }),
})

export type StallUtilitiesFormValues = z.input<typeof stallUtilitiesFormSchema>

export const emailSendSchema = z.object({
  user: z.object({
    email: z.email(),
    id: z.string(),
  }),
  url: z.url(),
})

// Create a TypeScript type from the schema
export type EmailSendType = z.infer<typeof emailSendSchema>

export const SocialProfile = z.object({
  given_name: z.string().min(1),
  family_name: z.string().min(1),
  name: z.string().min(1).optional(),
})

export type SocialProfileType = z.infer<typeof SocialProfile>

import { z } from "zod";

export const signupformSchema = z
	.object({
		name: z
			.string()
			.min(2, { message: "Name must be at least 2 characters long" }),
		email: z.string().email({ message: "Invalid email address" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.max(32, { message: "Password must be at most 32 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
		token: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const signinFormSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(8, { message: "Password must be at least 8 characters long" })
		.max(32, { message: "Password must be at most 32 characters long" })
		.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
	rememberMe: z.boolean(),
	token: z.string(),
});

export const forgotPasswordFormSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

export const resetPasswordFormSchema = z
	.object({
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const changePasswordFormSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		password: z
			.string()
			.min(8, { message: "Password must be at least 8 characters long" })
			.regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
		confirmPassword: z.string(),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const updateUsernameFormSchema = z.object({
	name: z
		.string()
		.min(2, { message: "Name must be at least 2 characters long" })
		.max(32, { message: "Name must be at most 32 characters long" }),
});

export const feedbackSchema = z.object({
	id: z.number().int().positive().min(1),
	happiness: z
		.number({ message: "Must choose a happiness" })
		.int()
		.positive({ message: "Must choose a happiness" })
		.min(1)
		.max(4, { message: "This is not a valid happiness" }),
	stall: z
		.number()
		.int()
		.positive({ message: "Must choose a stall number" })
		.min(1, { message: "Must choose a stall number" })
		.max(20),
	feedbackContent: z
		.string()
		.min(3, { message: "Must contain at least 3 character(s)" })
		.max(255),
});

export const createFeedbackSchema = feedbackSchema.omit({ id: true });

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
});

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
});

export const rentalsSchema = z.object({});

export const updateStallSchema = z
	.object({
		stallNumber: z.number().int().positive().min(1),
		stallName: z.string().min(1, "Stall name is required"),
		description: z.string().optional(),
		stallImage: z.string().url("Must be a valid URL").optional(),
		stallSize: z.coerce.number().min(0, "Size must be positive"),
		stallOwner: z.string().min(1, "Owner email is required").email().optional(),
		rentStatus: z.boolean({ message: "Rent status is required" }),
		startAt: z.coerce.date(),
		endAt: z.coerce.date(),
		stallTierNumber: z.object({
			tierId: z.coerce.number({ message: "Tier ID must be a number" }),
		}),
	})
	.refine((data) => data.endAt > data.startAt, {
		message: "End date must be after start date",
		path: ["endAt"],
	});

export const emailSchema = z.object({
	to: z.string().email(),
	subject: z.string(),
	text: z.string(),
});

export const appointmentSchema = z.object({
	notificationId: z.number().int().positive().min(1),
	userId: z.string(),
	notificationMessage: z.string(),
	notificationRead: z.boolean(),
	appointmentDate: z.coerce.date(),
	stallNumber: z.number().int().positive().min(1),
});

export const createAppointmentSchema = appointmentSchema.omit({
	notificationId: true,
	notificationRead: true,
});

export const updateAppointmentStatusSchema = z.object({
	notificationId: z.number().int().positive().min(1),
	notificationRead: z.boolean(),
	stallNumber: z.number().int().positive().min(1),
});

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
		.nullable(),
});

export type PaymentRecord = z.infer<typeof paymentSchema>;

export type CreatePaymentUtilityRequest = z.infer<
	typeof createPaymentUtilitySchema
>;

export interface RawPaymentRecord {
	paymentId: string;
	stallId: number;
	userId: string;
	paymentType: string;
	paymentAmount: string;
	paymentStatus: boolean;
	paymentDate: Date;
	paymentUser?: {
		id: string;
		name: string | null;
		image: string | null;
	} | null;
}

export const createPaymentIntentSchema = z.object({
	amount: z.number().positive(),
	stallId: z.number(),
	userId: z.string(),
});

export type CreatePaymentIntentRequest = z.infer<
	typeof createPaymentIntentSchema
>;

export const paymentIntentSchema = z.object({
	amount: z.number(),
	stallId: z.number(),
	userId: z.string(),
});

export type PaymentIntentRequest = z.infer<typeof paymentIntentSchema>;

export interface PaymentIntentResponse {
	clientSecret: string;
}

export interface PaymentNotification {
	notificationId: number;
	notificationMessage: string;
	notificationRead: boolean | null;
	appointmentDate: Date;
	stallNumber?: number;
	userId?: string | number;
}

export interface PaymentIntentParams {
	amount: number;
	stallId: number;
	userId: string;
}

export const createPaymentRecordSchema = z.object({
	paymentId: z.string(),
	stallId: z.number(),
	userId: z.string(),
	paymentAmount: z.string(),
	paymentType: z.string(),
	paymentStatus: z.boolean(),
	paymentDate: z.string(),
});

export const updatePaymentStatusSchema = z.object({
	paymentId: z.string(),
	newPaymentId: z.string(),
	paymentStatus: z.boolean(),
});

export type UpdatePaymentStatusRequest = z.infer<
	typeof updatePaymentStatusSchema
>;

export type CreatePaymentRecordRequest = z.infer<
	typeof createPaymentRecordSchema
>;

export const createPaymentUtilitySchema = z.object({
	paymentId: z.string(),
	stallId: z.number(),
	userId: z.string(),
	paymentAmount: z.string(),
	paymentType: z.string(),
	paymentStatus: z.boolean(),
	paymentDate: z.string(),
});

export const stallUtilitiesFormSchema = z.object({
	stallId: z.coerce
		.number({ message: "Please select a stall" })
		.int()
		.positive({ message: "Please select a stall" }),
	paymentType: z.enum(["water", "electric", "rental"], {
		required_error: "Please select a utility type",
	}),
	paymentAmount: z.coerce
		.number({ message: "Amount must be at least RM 0.01" })
		.positive({ message: "Amount must be positive" })
		.min(0.01, { message: "Amount must be at least RM 0.01" }),
	paymentDate: z.coerce.date({ message: "Please select a date" }),
});

export type StallUtilitiesFormValues = z.infer<typeof stallUtilitiesFormSchema>;

export const emailSendSchema = z.object({
	user: z.object({
		email: z.string().email(),
		id: z.string(),
	}),
	url: z.string().url(),
});

// Create a TypeScript type from the schema
export type EmailSendType = z.infer<typeof emailSendSchema>;

export const SocialProfile = z.object({
	given_name: z.string().min(1),
	family_name: z.string().min(1),
	name: z.string().min(1).optional(),
});

export type SocialProfileType = z.infer<typeof SocialProfile>;

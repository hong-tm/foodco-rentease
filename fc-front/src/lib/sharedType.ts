import { z } from "zod";

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

export const paymentIntentSchema = z.object({
	amount: z.number(),
	stallId: z.number(),
	userId: z.string(),
});

export type PaymentIntentRequest = z.infer<typeof paymentIntentSchema>;

export interface PaymentIntentResponse {
	clientSecret: string;
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

export type CreatePaymentRecordRequest = z.infer<
	typeof createPaymentRecordSchema
>;

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

export const createPaymentIntentSchema = z.object({
	amount: z.number().positive(),
	stallId: z.number(),
	userId: z.string(),
});

export type CreatePaymentIntentRequest = z.infer<
	typeof createPaymentIntentSchema
>;

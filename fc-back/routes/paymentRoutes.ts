import { Hono } from "hono";
import Stripe from "stripe";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { Payment, user, Stall } from "../db/userModel.js";
import type { PaymentRecord } from "../lib/sharedType.js";
import { paymentSchema } from "../lib/sharedType.js";

interface RawPaymentRecord {
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

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2024-12-18.acacia",
});

const createPaymentIntentSchema = z.object({
	amount: z.number().positive(),
	stallId: z.number(),
	userId: z.string(),
});

// Create a new Hono app for payment routes
const payment = new Hono();

// Get all payment records
payment.get("/records", async (c) => {
	try {
		const payments = await Payment.findAll({
			include: [
				{
					model: user,
					as: "paymentUser",
					attributes: ["id", "name", "image"],
				},
			],
			order: [["paymentDate", "DESC"]],
			raw: true,
			nest: true,
		});

		const transformedPayments = payments.map((payment: RawPaymentRecord) => ({
			paymentId: payment.paymentId,
			stallId: payment.stallId,
			userId: payment.userId,
			paymentType: payment.paymentType,
			paymentAmount: payment.paymentAmount,
			paymentStatus: payment.paymentStatus,
			paymentDate: new Date(payment.paymentDate),
			user: payment.paymentUser
				? {
						id: payment.paymentUser.id,
						name: payment.paymentUser.name,
						image: payment.paymentUser.image,
				  }
				: null,
		}));

		console.log("Transformed payments:", transformedPayments);
		return c.json(transformedPayments);
	} catch (error) {
		console.error("Error fetching payment records:", error);
		return c.json(
			{ error: "Failed to fetch payment records" },
			{ status: 500 }
		);
	}
});

// Download payment records as PDF
payment.get("/download-pdf", async (c) => {
	try {
		const payments = (await Payment.findAll({
			include: [
				{
					model: user,
					as: "paymentUser",
					attributes: ["name"],
				},
			],
			order: [["paymentDate", "DESC"]],
			raw: true,
			nest: true,
		})) as unknown as RawPaymentRecord[];

		// TODO: Implement proper PDF generation with a library like pdfkit
		const pdfContent = payments
			.map(
				(payment) =>
					`Payment ID: ${payment.paymentId}\n` +
					`User: ${payment.paymentUser?.name || "Unknown"}\n` +
					`Stall ID: ${payment.stallId}\n` +
					`Type: ${payment.paymentType}\n` +
					`Amount: RM${payment.paymentAmount}\n` +
					`Status: ${payment.paymentStatus ? "Paid" : "Pending"}\n` +
					`Date: ${new Date(payment.paymentDate).toLocaleDateString()}\n` +
					"----------------------------------------\n"
			)
			.join("\n");

		c.header("Content-Type", "text/plain");
		c.header("Content-Disposition", "attachment; filename=payment-records.txt");
		return c.text(pdfContent);
	} catch (error) {
		console.error("Error generating PDF:", error);
		return c.json({ error: "Failed to generate PDF" }, { status: 500 });
	}
});

// Download payment records as CSV
payment.get("/download-csv", async (c) => {
	try {
		const payments = (await Payment.findAll({
			include: [
				{
					model: user,
					as: "paymentUser",
					attributes: ["name"],
				},
			],
			order: [["paymentDate", "DESC"]],
			raw: true,
			nest: true,
		})) as unknown as RawPaymentRecord[];

		// Create CSV content with headers
		const csvHeader = "Payment ID,User,Stall ID,Type,Amount (RM),Status,Date\n";
		const csvRows = payments
			.map((payment) => {
				const date = new Date(payment.paymentDate).toLocaleDateString();
				const status = payment.paymentStatus ? "Paid" : "Pending";
				const userName = payment.paymentUser?.name || "Unknown User";
				return `"${payment.paymentId}","${userName}",${payment.stallId},"${payment.paymentType}",${payment.paymentAmount},"${status}","${date}"`;
			})
			.join("\n");

		const csvContent = csvHeader + csvRows;

		c.header("Content-Type", "text/csv");
		c.header("Content-Disposition", "attachment; filename=payment-records.csv");
		return c.text(csvContent);
	} catch (error) {
		console.error("Error generating CSV:", error);
		return c.json({ error: "Failed to generate CSV" }, { status: 500 });
	}
});

// Add the create-payment-intent route
payment.post("/create-payment-intent", async (c) => {
	try {
		const body = await c.req.json();
		console.log("Received payment request body:", body);

		const result = createPaymentIntentSchema.safeParse(body);
		if (!result.success) {
			console.error("Validation error:", result.error);
			return c.json(
				{ error: "Invalid request data", details: result.error.errors },
				{ status: 400 }
			);
		}

		const { amount, stallId, userId } = result.data;
		console.log("Validated payment request:", { amount, stallId, userId });

		// Ensure amount is in smallest currency unit (cents)
		const amountInCents = Math.round(amount * 100);
		console.log("Creating payment intent for amount (cents):", amountInCents);

		const paymentIntent = await stripe.paymentIntents.create({
			amount: amountInCents,
			currency: "myr",
			automatic_payment_methods: {
				enabled: true,
			},
			metadata: {
				stallId: stallId.toString(),
				userId: userId,
			},
		});

		console.log("Payment Intent created:", paymentIntent.id);

		return c.json({
			clientSecret: paymentIntent.client_secret,
		});
	} catch (error) {
		console.error("Error creating payment intent:", error);
		if (error instanceof Stripe.errors.StripeError) {
			return c.json(
				{ error: error.message },
				{ status: error.statusCode || 500 }
			);
		}
		return c.json(
			{ error: "Failed to create payment intent" },
			{ status: 500 }
		);
	}
});

// Add webhook handler for payments
payment.post("/webhook", async (c) => {
	console.log("========== WEBHOOK REQUEST START ==========");
	console.log("Headers:", {
		signature: c.req.header("stripe-signature"),
		contentType: c.req.header("content-type"),
	});

	const sig = c.req.header("stripe-signature");
	const rawBody = await c.req.raw.text();
	console.log("Raw webhook body length:", rawBody.length);

	if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
		console.error("❌ Webhook Error: Missing signature or secret", {
			hasSignature: !!sig,
			hasSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
			webhookSecret: process.env.STRIPE_WEBHOOK_SECRET?.slice(0, 5) + "...", // Log first 5 chars for verification
		});
		return c.json(
			{ error: "Missing signature or webhook secret" },
			{ status: 400 }
		);
	}

	try {
		console.log("🔍 Verifying webhook signature...");
		const event = stripe.webhooks.constructEvent(
			rawBody,
			sig,
			process.env.STRIPE_WEBHOOK_SECRET
		);
		console.log("✅ Webhook signature verified successfully");
		console.log("Event details:", {
			type: event.type,
			id: event.id,
			created: new Date(event.created * 1000).toISOString(),
		});

		// Ensure we're working with a PaymentIntent object
		if (!event.data.object || event.data.object.object !== "payment_intent") {
			console.log("⚠️ Event ignored: Not a payment intent object");
			return c.json({
				received: true,
				warning: "Event ignored - not a payment intent",
			});
		}

		const paymentIntent = event.data.object as Stripe.PaymentIntent;
		console.log("💳 Payment Intent details:", {
			id: paymentIntent.id,
			amount: paymentIntent.amount,
			status: paymentIntent.status,
			metadata: paymentIntent.metadata,
			created: new Date(paymentIntent.created * 1000).toISOString(),
		});

		// Specifically handle payment_intent.succeeded
		if (event.type === "payment_intent.succeeded") {
			console.log("🎉 Processing successful payment intent");
			const stallId = parseInt(paymentIntent.metadata.stallId);
			const userId = paymentIntent.metadata.userId;
			console.log("Payment metadata:", {
				stallId,
				userId,
			});

			if (isNaN(stallId)) {
				console.error(
					"❌ Invalid stallId in metadata:",
					paymentIntent.metadata
				);
				return c.json(
					{ error: "Invalid stallId in payment metadata" },
					{ status: 400 }
				);
			}

			if (!userId) {
				console.error("❌ Missing userId in metadata:", paymentIntent.metadata);
				return c.json(
					{ error: "Missing userId in payment metadata" },
					{ status: 400 }
				);
			}

			try {
				console.log("📝 Creating payment record with data:", {
					paymentId: paymentIntent.id,
					stallId: stallId,
					userId: userId,
					amount: paymentIntent.amount / 100,
					date: new Date(paymentIntent.created * 1000),
				});

				const payment = await Payment.create({
					paymentId: paymentIntent.id,
					paymentType: "rental",
					paymentAmount: (paymentIntent.amount / 100).toString(),
					paymentStatus: true,
					paymentDate: new Date(paymentIntent.created * 1000),
					stallId: stallId,
					userId: userId,
				});

				// Calculate dates for stall update
				const startAt = new Date();
				const endAt = new Date();
				endAt.setFullYear(endAt.getFullYear() + 1); // Add 1 year

				// Update stall information
				const [updatedCount] = await Stall.update(
					{
						stallOwner: userId,
						rentStatus: true,
						startAt: startAt,
						endAt: endAt,
					},
					{
						where: { stallNumber: stallId },
					}
				);

				if (updatedCount === 0) {
					throw new Error(`No stall found with ID ${stallId}`);
				}

				// Update user role to rental
				const [userUpdateCount] = await user.update(
					{
						role: "rental",
					},
					{
						where: { id: userId },
					}
				);

				if (userUpdateCount === 0) {
					throw new Error(`No user found with ID ${userId}`);
				}

				console.log("✅ Payment record, stall, and user update completed:", {
					payment: payment.toJSON(),
					stallId: stallId,
					userId: userId,
					startAt,
					endAt,
					userRole: "rental",
				});

				return c.json({
					received: true,
					type: event.type,
					paymentId: paymentIntent.id,
					status: "success",
					dbRecord: payment.toJSON(),
					stallUpdate: {
						stallId,
						userId,
						startAt,
						endAt,
					},
					userUpdate: {
						userId,
						role: "rental",
					},
				});
			} catch (dbError: any) {
				console.error("❌ Database Error:", {
					message: dbError.message,
					stack: dbError.stack,
					code: dbError.code,
					detail: dbError.detail,
				});
				// Don't throw the error, just return a 500 response
				return c.json(
					{
						error: "Failed to save payment record",
						detail: dbError.message,
					},
					{ status: 500 }
				);
			}
		} else {
			console.log(`ℹ️ Ignoring non-success event type: ${event.type}`);
			return c.json({
				received: true,
				type: event.type,
				status: "ignored",
			});
		}
	} catch (err: any) {
		console.error("❌ Webhook Error:", {
			message: err.message,
			stack: err.stack,
			type: err.type,
		});
		if (err instanceof stripe.errors.StripeSignatureVerificationError) {
			console.error("🔐 Signature verification failed");
			return c.json(
				{ error: "Webhook signature verification failed" },
				{ status: 400 }
			);
		}
		return c.json({ error: "Webhook processing failed" }, { status: 500 });
	} finally {
		console.log("========== WEBHOOK REQUEST END ==========\n");
	}
});

// Create payment record directly
payment.post("/create-record", async (c) => {
	try {
		const body = await c.req.json();
		console.log("Creating payment record:", body);

		try {
			// Create payment record
			const payment = await Payment.create({
				paymentId: body.paymentId,
				paymentType: body.paymentType,
				paymentAmount: body.paymentAmount,
				paymentStatus: body.paymentStatus,
				paymentDate: new Date(body.paymentDate),
				stallId: body.stallId,
				userId: body.userId,
			});

			// Calculate dates
			const startAt = new Date();
			const endAt = new Date();
			endAt.setFullYear(endAt.getFullYear() + 1); // Add 1 year

			// Update stall information
			const [updatedCount] = await Stall.update(
				{
					stallOwner: body.userId,
					rentStatus: true,
					startAt: startAt,
					endAt: endAt,
				},
				{
					where: { stallNumber: body.stallId },
				}
			);

			if (updatedCount === 0) {
				throw new Error(`No stall found with ID ${body.stallId}`);
			}

			// Update user role to rental
			const [userUpdateCount] = await user.update(
				{
					role: "rental",
				},
				{
					where: { id: body.userId },
				}
			);

			if (userUpdateCount === 0) {
				throw new Error(`No user found with ID ${body.userId}`);
			}

			console.log("✅ Payment record, stall, and user update completed:", {
				payment: payment.toJSON(),
				stallId: body.stallId,
				startAt,
				endAt,
				userId: body.userId,
				userRole: "rental",
			});

			return c.json({
				success: true,
				payment: payment.toJSON(),
				stall: {
					stallId: body.stallId,
					startAt,
					endAt,
				},
				user: {
					userId: body.userId,
					role: "rental",
				},
			});
		} catch (error) {
			throw error;
		}
	} catch (error: any) {
		console.error("Error creating payment record and updating stall:", error);
		return c.json(
			{
				error: "Failed to process payment record",
				details: error.message,
			},
			{ status: 500 }
		);
	}
});

export default payment;

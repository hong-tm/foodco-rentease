import { Hono } from "hono";
import Stripe from "stripe";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
	throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2024-12-18.acacia",
});

const createPaymentIntentSchema = z.object({
	amount: z.number().positive(),
});

// Create a new Hono app for payment routes
const payment = new Hono();

// Add the create-payment-intent route
payment.post(
	"/create-payment-intent",
	zValidator("json", createPaymentIntentSchema),
	async (c) => {
		try {
			const { amount } = await c.req.valid("json");

			// Ensure amount is in smallest currency unit (cents)
			const amountInCents = Math.round(amount * 100);

			console.log("Creating payment intent for amount (cents):", amountInCents);

			const paymentIntent = await stripe.paymentIntents.create({
				amount: amountInCents,
				currency: "myr",
				automatic_payment_methods: {
					enabled: true,
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
	}
);

export default payment;

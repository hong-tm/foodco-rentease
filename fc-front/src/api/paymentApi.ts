import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import config from "@/config/config";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
export const stripePromise = loadStripe(
	"pk_test_51Q0PgoRs6oUNWmV9hY185GXM1BsHqXDjJyvzQVfXtBtc5AFsIyGt4Fm5tDO27Y81CfA0WjfA2jUesfYy6rvvncyi00dzTzDXSX",
	{
		apiVersion: "2024-12-18.acacia",
	}
);

// Create an axios instance with default config
const api = axios.create({
	baseURL: config.apiUrl + "/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

interface PaymentIntentResponse {
	clientSecret: string;
}

export const createPaymentIntent = async (
	amount: number,
	stallId: number,
	userId: string
): Promise<PaymentIntentResponse> => {
	try {
		console.log("Creating payment intent:", { amount, stallId, userId });
		const response = await api.post<PaymentIntentResponse>(
			"/payment/create-payment-intent",
			{
				amount: Number(amount),
				stallId: Number(stallId),
				userId: userId,
			}
		);
		console.log("Payment intent response:", response.data);

		if (!response.data.clientSecret) {
			throw new Error("No client secret received");
		}

		return response.data;
	} catch (error) {
		console.error("Payment intent creation error:", error);
		if (axios.isAxiosError(error) && error.response) {
			throw new Error(error.response.data.error || "Failed to create payment");
		}
		throw error;
	}
};

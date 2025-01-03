import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import config from "@/config/config";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
export const stripePromise = loadStripe(
	"pk_test_51Q0PgoRs6oUNWmV9hY185GXM1BsHqXDjJyvzQVfXtBtc5AFsIyGt4Fm5tDO27Y81CfA0WjfA2jUesfYy6rvvncyi00dzTzDXSX"
);

// Create an axios instance with default config
const api = axios.create({
	baseURL: config.apiUrl + "/api",
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

export const createPaymentIntent = async (amount: number) => {
	try {
		console.log("Creating payment intent for amount:", amount);
		const response = await api.post("/payment/create-payment-intent", {
			amount,
		});
		console.log("Payment intent response:", response.data);
		return response.data;
	} catch (error) {
		console.error("Payment intent creation error:", error);
		throw error;
	}
};

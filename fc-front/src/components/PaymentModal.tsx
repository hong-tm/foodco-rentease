import { useState } from "react";
import {
	Elements,
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { StripeElementsOptions } from "@stripe/stripe-js";
import { stripePromise } from "@/api/paymentApi";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { toast } from "sonner";

interface CheckoutFormProps {
	amount: number;
}

const CheckoutForm = ({ amount }: CheckoutFormProps) => {
	const stripe = useStripe();
	const elements = useElements();
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			setErrorMessage("Stripe has not been initialized");
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);

		try {
			const { error, paymentIntent } = await stripe.confirmPayment({
				elements,
				confirmParams: {
					return_url: `${window.location.origin}/dashboard/payment-success`,
				},
				redirect: "if_required",
			});

			if (error) {
				setErrorMessage(error.message ?? "An unknown error occurred");
				toast.error(error.message ?? "Payment failed");
			} else if (paymentIntent && paymentIntent.status === "succeeded") {
				toast.success("Payment successful!");
				window.location.href = `${window.location.origin}/dashboard/payment-success`;
			}
		} catch (error) {
			console.error("Payment error:", error);
			setErrorMessage("An unexpected error occurred");
			toast.error("Payment failed");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="text-lg font-semibold mb-4">
				Amount to pay: RM{amount.toFixed(2)}
			</div>
			<PaymentElement />
			{errorMessage && (
				<div className="text-sm text-red-500 mt-2">{errorMessage}</div>
			)}
			<div className="mt-4 flex justify-end">
				<Button type="submit" disabled={!stripe || isLoading}>
					{isLoading ? "Processing..." : "Pay Now"}
				</Button>
			</div>
		</form>
	);
};

interface PaymentModalProps {
	isOpen: boolean;
	onClose: () => void;
	clientSecret: string;
	amount: number;
}

export default function PaymentModal({
	isOpen,
	onClose,
	clientSecret,
	amount,
}: PaymentModalProps) {
	const options: StripeElementsOptions = {
		clientSecret,
		appearance: {
			theme: "stripe" as const,
			variables: {
				colorPrimary: "#0F172A",
			},
		},
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Payment Details</DialogTitle>
				</DialogHeader>
				<Elements stripe={stripePromise} options={options}>
					<CheckoutForm amount={amount} />
				</Elements>
			</DialogContent>
		</Dialog>
	);
}

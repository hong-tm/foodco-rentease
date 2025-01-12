import {
	PaymentElement,
	useStripe,
	useElements,
} from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface CheckoutFormProps {
	amount: number;
	onSuccess: (paymentIntentId: string) => void;
	isProcessing: boolean;
	setIsProcessing: (value: boolean) => void;
}

export default function CheckoutForm({
	amount,
	onSuccess,
	isProcessing,
	setIsProcessing,
}: CheckoutFormProps) {
	const stripe = useStripe();
	const elements = useElements();

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!stripe || !elements) {
			toast.error("Stripe has not been initialized");
			return;
		}

		setIsProcessing(true);

		try {
			const result = await stripe.confirmPayment({
				elements,
				redirect: "if_required",
			});

			if (result.error) {
				toast.error(result.error.message ?? "Payment failed");
			} else if (result.paymentIntent?.status === "succeeded") {
				toast.success("Payment successful!");
				await onSuccess(result.paymentIntent.id);
			}
		} catch (error) {
			console.error("Payment error:", error);
			toast.error("An unexpected error occurred");
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="text-lg font-semibold mb-4">
				Amount to pay: RM{amount.toFixed(2)}
			</div>
			<PaymentElement />
			<div className="mt-4">
				<Button
					type="submit"
					className="w-full"
					disabled={!stripe || isProcessing}
				>
					{isProcessing ? "Processing..." : "Pay Now"}
				</Button>
			</div>
		</form>
	);
}
